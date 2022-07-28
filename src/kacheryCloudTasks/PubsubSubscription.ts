import { randomAlphaString } from 'components/misc/randomAlphaString';
import PubNub, { StatusEvent } from 'pubnub';
import { isSubscribeToPubsubChannelResponse, SubscribeToPubsubChannelRequest } from "types/KacherycloudRequest";
import { PubsubChannelName, PubsubMessage } from "types/PubsubMessage";
import kacherycloudApiRequest from "./kacherycloudApiRequest";

type MessageCallback = (channelName: PubsubChannelName, message: PubsubMessage) => void

class PubsubSubscription {
    #messageCallbacks: MessageCallback[] = []
    #pubnub: PubNub | undefined = undefined
    #unsubscribed: boolean = false
    constructor(private d: {
        projectId: string,
        channelName: PubsubChannelName
    }) {
        const recreatePubnubClient = async () => {
            let thisPubnubCanceled = false
            if (this.#pubnub !== undefined) {
                this.#pubnub.unsubscribeAll()
                this.#pubnub = undefined
            }
            const req = this._formSubscribeRequest()
            const resp = await kacherycloudApiRequest(req, {retryInterval: 5000})
            if (!isSubscribeToPubsubChannelResponse(resp)) {
                throw Error('Unexpected response to subscribeToPubsubChannel')
            }
            const {subscribeKey, token, uuid, pubsubChannelName} = resp
            var pubnub = new PubNub({
                subscribeKey,
                uuid
            })
            pubnub.setToken(token)
            console.info(`Subscribing to channel: ${pubsubChannelName}`)
            pubnub.addListener({
                message: (messageEvent => {
                    if (thisPubnubCanceled) return
                    console.info('RECEIVED PUBSUB MSG:', messageEvent.message)

                    // return immediately so we don't have the potential to cause problems
                    // with pubnub
                    setTimeout(() => {
                        this.#messageCallbacks.forEach(cb => {
                            cb(d.channelName, messageEvent.message)
                        })
                    }, 1)
                }),
                status: ((e: StatusEvent) => {
                    if (thisPubnubCanceled) return
                    console.log('PUBNUB status', e)
                    if (e.category === 'PNNetworkUpCategory') {
                        // this means the network has glitched
                        // so we need to recreate the client
                        thisPubnubCanceled = true // don't listen to any more events from this one
                        recreatePubnubClient()
                    }
                })
            })
            pubnub.subscribe({
                channels: [pubsubChannelName]
            })
            this.#pubnub = pubnub
        }
        recreatePubnubClient()
        this._startRenewingToken()
    }
    onMessage(callback: MessageCallback) {
        this.#messageCallbacks.push(callback)
    }
    unsubscribe() {
        console.info('Unsubscribing from pubsub channels')
        this.#messageCallbacks = []
        this.#pubnub && this.#pubnub.unsubscribeAll()
        this.#unsubscribed = true
    }
    _formSubscribeRequest() {
        const req: SubscribeToPubsubChannelRequest = {
            payload: {
                type: 'subscribeToPubsubChannel',
                timestamp: Date.now(),
                channelName: this.d.channelName,
                projectId: this.d.projectId,
                uuid: getPubNubUuid()
            }
        }
        return req
    }
    async _startRenewingToken() {
        if (this.#unsubscribed) return
        while (true) {
            // await sleepMsec(9 * 60 * 1000) // renew every 9 minutes (tokens are good for 30 minutes)
            await sleepMsec(3 * 60 * 1000) // renew every 3 minutes for now - for troubleshooting
            if (this.#pubnub) {
                const req = this._formSubscribeRequest()
                const resp = await kacherycloudApiRequest(req)
                if (!isSubscribeToPubsubChannelResponse(resp)) {
                    throw Error('Unexpected response to subscribeToPubsubChannel when renewing token')
                }
                if (this.#pubnub) {
                    console.info('SETTING PUBNUB TOKEN')
                    this.#pubnub.setToken(resp.token)
                }
            }
        }
    }
}

export const sleepMsec = async (msec: number, continueFunction: (() => boolean) | undefined = undefined): Promise<void> => {
    const m = msec
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, m)
    })
}

const getPubNubUuid = () => {
    const a = localStorage['figurl-pubnub-uuid']
    if (!a) {
        localStorage['figurl-pubnub-uuid'] = 'figurl-' + randomAlphaString(10)
    }
    return localStorage['figurl-pubnub-uuid']
}

export default PubsubSubscription
import PubNub from 'pubnub';
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
        const req = this._formSubscribeRequest()
        kacherycloudApiRequest(req).then(resp => {
            if (!isSubscribeToPubsubChannelResponse(resp)) {
                throw Error('Unexpected response to subscribeToPubsubChannel')
            }
            const {subscribeKey, token, uuid, pubsubChannelName} = resp
            var pubnub = new PubNub({
                subscribeKey,
                uuid
            })
            pubnub.setToken(token)
            pubnub.subscribe({
                channels: [pubsubChannelName]
            })
            pubnub.addListener({
                message: (messageEvent => {
                    this.#messageCallbacks.forEach(cb => {
                        cb(d.channelName, messageEvent.message)
                    })
                })
            })
            this.#pubnub = pubnub
        })
        this._startRenewingToken()
    }
    onMessage(callback: MessageCallback) {
        this.#messageCallbacks.push(callback)
    }
    unsubscribe() {
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
                projectId: this.d.projectId
            }
        }
        return req
    }
    async _startRenewingToken() {
        if (this.#unsubscribed) return
        while (true) {
            await sleepMsec(9 * 60 * 1000) // renew every 9 minutes (tokens are good for 10 minutes)
            const req = this._formSubscribeRequest()
            const resp = await kacherycloudApiRequest(req)
            if (!isSubscribeToPubsubChannelResponse(resp)) {
                throw Error('Unexpected response to subscribeToPubsubChannel when renewing token')
            }
            if (!this.#pubnub) throw Error('Unexpected: this.#pubnub is undefined')
            this.#pubnub.setToken(resp.token)
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

export default PubsubSubscription
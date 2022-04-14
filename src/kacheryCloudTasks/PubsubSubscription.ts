import PubNub from 'pubnub';
import { SubscribeToPubsubChannelRequest } from "types/KacherycloudRequest";
import { PubsubChannelName, PubsubMessage } from "types/PubsubMessage";
import kacherycloudApiRequest from "./kacherycloudApiRequest";

type MessageCallback = (channelName: PubsubChannelName, message: PubsubMessage) => void

class PubsubSubscription {
    #messageCallbacks: MessageCallback[] = []
    #pubnub: PubNub | undefined = undefined
    constructor(private d: {
        projectId: string,
        channelName: PubsubChannelName
    }) {
        const req: SubscribeToPubsubChannelRequest = {
            payload: {
                type: 'subscribeToPubsubChannel',
                timestamp: Date.now(),
                channelName: d.channelName,
                projectId: d.projectId
            }
        }
        kacherycloudApiRequest(req).then(resp => {
            if (resp.type !== 'subscribeToPubsubChannel') {
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
    }
    onMessage(callback: MessageCallback) {
        this.#messageCallbacks.push(callback)
    }
    unsubscribe() {
        this.#messageCallbacks = []
        this.#pubnub && this.#pubnub.unsubscribeAll()
    }
}

export default PubsubSubscription
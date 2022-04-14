import { JSONObject } from "commonInterface/kacheryTypes"
import kacherycloudApiRequest from "kacheryCloudTasks/kacherycloudApiRequest"
import PubsubSubscription from "kacheryCloudTasks/PubsubSubscription"
import { GetFeedInfoRequest, GetFeedMessagesRequest, isGetFeedInfoResponse, isGetFeedMessagesResponse } from "types/KacherycloudRequest"

class KacheryCloudFeed {
    #feedId: string
    #messages: JSONObject[] = []
    #onMessagesUpdatedCallbacks: ((startMessageNumber: number, messages: JSONObject[]) => void)[] = []
    constructor(feedId: string) {
        this.#feedId = feedId
        this._initialize()
    }
    get feedId() {
        return this.#feedId
    }
    getMessages() {
        return this.#messages.slice(0)
    }
    onMessagesUpdated(callback: (startMessageNumber: number, messages: JSONObject[]) => void) {
        this.#onMessagesUpdatedCallbacks.push(callback)
        const cancel = () => {
            this.#onMessagesUpdatedCallbacks = this.#onMessagesUpdatedCallbacks.filter(cb => (cb !== callback))
        }
        return cancel
    }
    async _initialize() {
        let pubsubSubscription: PubsubSubscription | undefined = undefined
        const req: GetFeedInfoRequest = {
            payload: {
                type: 'getFeedInfo',
                timestamp: Date.now(),
                feedId: this.#feedId
            }
        }
        const resp = await kacherycloudApiRequest(req)
        if (!isGetFeedInfoResponse(resp)) throw Error('Unexpected response')
        const {projectId} = resp

        pubsubSubscription = new PubsubSubscription({
            projectId,
            channelName: 'feedUpdates'
        })
        pubsubSubscription.onMessage((pubsubChannelName, msg) => {
            if ((msg.type === 'feedMessagesAppended') && (msg.feedId === this.#feedId)) {
                this._getMessages()
            }
        })
        await this._getMessages()
    }
    async _getMessages() {
        const req: GetFeedMessagesRequest = {
            payload: {
                type: 'getFeedMessages',
                timestamp: Date.now(),
                feedId: this.#feedId,
                startMessageNumber: this.#messages.length
            }
        }
        const resp = await kacherycloudApiRequest(req)
        if (!isGetFeedMessagesResponse(resp)) throw Error('Unexpected response')
        if (resp.messages.length === 0) return
        if ((resp.startMessageNumber <= this.#messages.length) && (this.#messages.length - resp.startMessageNumber < resp.messages.length)) {
            this.#messages = [...this.#messages, ...resp.messages.slice(this.#messages.length - resp.startMessageNumber)]
            this.#onMessagesUpdatedCallbacks.forEach(cb => {cb(resp.startMessageNumber, resp.messages)})
        }
    }
}

export default KacheryCloudFeed
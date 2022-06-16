import { GetProjectBucketBaseUrlRequest, PublishToPubsubChannelRequest } from "types/KacherycloudRequest";
import { PubsubChannelName, PubsubMessage, TaskType } from "types/PubsubMessage";
import { sha1OfObject, sha1OfString } from "../commonInterface/kacheryTypes";
import { randomAlphaString } from "../components/misc/randomAlphaString";
import kacherycloudApiRequest from "./kacherycloudApiRequest";
import PubsubSubscription from "./PubsubSubscription";
import TaskJob from "./TaskJob";

class KacheryCloudTaskManager {
    #taskJobs: {[key: string]: TaskJob<any>} = {}
    #projectBucketBaseUrl?: string
    #pubsubSubscription: PubsubSubscription | undefined
    #updateCallbacks: (() => void)[] = []
    constructor(private d: {
        projectId: string
    }) {
        if (d.projectId) {
            this.#pubsubSubscription = new PubsubSubscription({
                projectId: d.projectId,
                channelName: 'provideTasks'
            })
            this.#pubsubSubscription.onMessage((channelName, message) => {
                this._handlePubsubMessage(channelName, message)
            })
        }
    }
    runTask <ReturnType>(o: {taskType: TaskType, taskName: string, taskInput: any}): TaskJob<ReturnType> {
        const taskJobId = o.taskType === 'calculation' ? (
            sha1OfObject({taskName: o.taskName, taskInput: o.taskInput})
        ) : (
            sha1OfString(randomAlphaString(100))
        )
        if (taskJobId.toString() in this.#taskJobs) {
            return this.#taskJobs[taskJobId.toString()]
        }
        else {
            const tj = new TaskJob<ReturnType>({
                taskType: o.taskType,
                taskName: o.taskName,
                taskInput: o.taskInput,
                taskJobId,
                publishToPubsubChannel: (channelName: PubsubChannelName, message: PubsubMessage) => {return this._publishToPubsubChannel(channelName, message)},
                getProjectBucketBaseUrl: () => {return this._getProjectBucketBaseUrl()}
            })
            const triggerUpdate = () => {
                this.#updateCallbacks.forEach(cb => {cb()})
            }
            this.#taskJobs[taskJobId.toString()] = tj
            tj.onStarted(triggerUpdate)
            tj.onError(triggerUpdate)
            tj.onFinished(triggerUpdate)
            triggerUpdate()
            return tj
        }
    }
    async runTaskAsync <ReturnType>(
        o: {taskType: TaskType, taskName: string, taskInput: any}
    ): Promise<ReturnType> {
        return new Promise<ReturnType>((resolve, reject) => {
            const task = this.runTask(o)
            task.onFinished(() => {
                resolve(task.result as ReturnType)
            })
            task.onError(() => {
                reject(new Error(task.errorMessage))
            })
        })
    }
    unsubscribe() {
        if (this.#pubsubSubscription) {
            this.#pubsubSubscription.unsubscribe()
        }
    }
    getAllTaskJobs() {
        return Object.values(this.#taskJobs).sort((a, b) => (a.timestampCreated - b.timestampCreated))
    }
    onUpdate(callback: () => void) {
        this.#updateCallbacks.push(callback)
    }
    _handlePubsubMessage(channelName: PubsubChannelName, message: PubsubMessage) {
        if (channelName === 'provideTasks') {
            if (message.type === 'setTaskStatus') {
                const jobId = message.taskJobId
                if (jobId.toString() in this.#taskJobs) {
                    this.#taskJobs[jobId.toString()].handlePubsubMessage(channelName, message)
                }
            }
        }
    }
    async _publishToPubsubChannel(channelName: PubsubChannelName, message: PubsubMessage) {
        const req: PublishToPubsubChannelRequest = {
            payload: {
                type: 'publishToPubsubChannel',
                timestamp: Date.now(),
                channelName,
                message,
                projectId: this.d.projectId
            }
        }
        const resp = await kacherycloudApiRequest(req)
        if (resp.type !== 'publishToPubsubChannel') {
            throw Error('Unexpected response to publishToPubsubChannel')
        }
    }
    async _getProjectBucketBaseUrl() {
        if (this.#projectBucketBaseUrl) {
            return this.#projectBucketBaseUrl as string
        }
        const req: GetProjectBucketBaseUrlRequest = {
            payload: {
                type: 'getProjectBucketBaseUrl',
                timestamp: Date.now(),
                projectId: this.d.projectId
            }
        }
        const resp = await kacherycloudApiRequest(req)
        if (resp.type !== 'getProjectBucketBaseUrl') {
            throw Error('Unexpected response to getProjectBucketBaseUrl')
        }
        this.#projectBucketBaseUrl = resp.projectBaseUrl
        return this.#projectBucketBaseUrl as string
    }
}

export default KacheryCloudTaskManager
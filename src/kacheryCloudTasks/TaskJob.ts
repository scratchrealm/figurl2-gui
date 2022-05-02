import axios from "axios";
import { Sha1Hash } from "commonInterface/kacheryTypes";
import { PubsubChannelName, PubsubMessage, TaskStatus, TaskType } from "types/PubsubMessage";
import deserializeReturnValue from "./deserializeReturnValue";

export type TaskJobStatus = 'waiting' | 'started' | 'finished' | 'error'
export const isTaskJobStatus = (x: any): x is TaskJobStatus => (['waiting', 'started', 'finished', 'error'].includes(x || ''))

class TaskJob<ReturnType> {
    #status: TaskJobStatus = 'waiting'
    #result?: ReturnType = undefined
    #errorMessage: string | undefined = undefined
    #onFinishedCallbacks: (() => void)[] = []
    #onErrorCallbacks: (() => void)[] = []
    #onStartedCallbacks: (() => void)[] = []
    #timestampCreated = Date.now()
    constructor(private d: {
        taskType: TaskType,
        taskName: string,
        taskInput: any,
        taskJobId: Sha1Hash,
        publishToPubsubChannel: (channelName: PubsubChannelName, message: PubsubMessage) => Promise<void>,
        getProjectBucketBaseUrl: () => Promise<string>
    }) {
        this._start()
    }
    get taskType() {
        return this.d.taskType
    }
    get taskName() {
        return this.d.taskName
    }
    get taskInput() {
        return this.d.taskInput
    }
    get taskJobId() {
        return this.d.taskJobId
    }
    get status() {
        return this.#status
    }
    get result(): ReturnType | undefined {
        return this.#result
    }
    get errorMessage() {
        return this.#errorMessage
    }
    get timestampCreated() {
        return this.#timestampCreated
    }
    onFinished(callback: () => void) {
        if (this.#status === 'finished') {
            callback()
            return () => {}
        }
        this.#onFinishedCallbacks.push(callback)
        const cancel = () => {
            this.#onFinishedCallbacks = this.#onFinishedCallbacks.filter(cb => (cb !== callback))
        }
        return cancel
    }
    onError(callback: () => void) {
        if (this.#status === 'error') {
            callback()
            return () => {}
        }
        this.#onErrorCallbacks.push(callback)
        const cancel = () => {
            this.#onErrorCallbacks = this.#onErrorCallbacks.filter(cb => (cb !== callback))
        }
        return cancel
    }
    onStarted(callback: () => void) {
        if ((this.#status === 'started') || (this.#status === 'finished') || (this.#status === 'error')) {
            callback()
            return () => {}
        }
        this.#onStartedCallbacks.push(callback)
        const cancel = () => {
            this.#onStartedCallbacks = this.#onStartedCallbacks.filter(cb => (cb !== callback))
        }
        return cancel
    }
    handlePubsubMessage(channelName: PubsubChannelName, message: PubsubMessage) {
        if (channelName === 'provideTasks') {
            if (message.type === 'setTaskStatus') {
                const jobId = message.taskJobId
                if (jobId !== this.d.taskJobId) {
                    throw Error('Unexpected mismatch in job ID')
                }
                if (message.taskName !== this.d.taskName) {
                    throw Error('Unexpected mismatch in task name')
                }
                this._setTaskStatus(message.status, message.errorMessage) 
            }
            else {
                throw Error('Unexpected message type in handlePubsubMessage')
            }
        }
    }
    _setTaskStatus(status: TaskStatus, errorMessage?: string) {
        if (status === this.#status) return
        if (status === 'finished') {
            if (this.d.taskType === 'calculation') {
                this._downloadResult().then(() => {
                    this.#status = status
                    this.#onFinishedCallbacks.forEach(cb => {cb()})    
                }).catch(err => {
                    this._setTaskStatus('error', 'Error downloading result')
                })
            }
            else {
                this.#status = status
                this.#onFinishedCallbacks.forEach(cb => {cb()})
            }
        }
        else if (status === 'error') {
            this.#status = status
            this.#errorMessage = errorMessage
            this.#onErrorCallbacks.forEach(cb => {cb()})
        }
        else if (status === 'started') {
            this.#status = status
            this.#onStartedCallbacks.forEach(cb => {cb()})
        }
    }
    async _downloadResult() {
        return new Promise<void>((resolve, reject) => {
            const s = this.d.taskJobId
            this.d.getProjectBucketBaseUrl().then(projectBucketBaseUrl => {
                const url = `${projectBucketBaseUrl}/taskResults/${this.d.taskName}/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
                axios.get(url).then((response) => {
                    const resultData = response.data
                    deserializeReturnValue(resultData).then(dr => {
                        this.#result = dr as ReturnType
                        resolve()
                    })
                }).catch((err) => {
                    reject(err)
                })
            })
        })
    }
    async _start() {
        if (this.taskType === 'calculation') {
            // first try to download the cached version
            try {
                await this._downloadResult()
                // we got the cached version!
                this.#status = 'finished'
                this.#onFinishedCallbacks.forEach(cb => {cb()})
                return
            }
            catch(err) {
                // not cached
            }
        }
        const message: PubsubMessage = {
            type: 'requestTask',
            taskType: this.d.taskType,
            taskName: this.d.taskName,
            taskInput: this.d.taskInput,
            taskJobId: this.d.taskJobId
        }
        this.d.publishToPubsubChannel('requestTasks', message).catch(err => {
            console.warn(err)
            console.warn('Error publishing to requestTasks channel')
        })
    }
}

export default TaskJob
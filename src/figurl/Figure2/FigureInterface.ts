import axios from 'axios'
import { UserId } from 'commonInterface/kacheryTypes'
import GoogleSignInClient from 'components/googleSignIn/GoogleSignInClient'
import KacheryCloudFeed from 'kacheryCloudFeeds/KacheryCloudFeed'
import kacheryCloudFeedManager from 'kacheryCloudFeeds/kacheryCloudFeedManager'
import deserializeReturnValue from 'kacheryCloudTasks/deserializeReturnValue'
import KacheryCloudTaskManager from 'kacheryCloudTasks/KacheryCloudTaskManager'
import { sleepMsec } from 'kacheryCloudTasks/PubsubSubscription'
import TaskJob from 'kacheryCloudTasks/TaskJob'
import { MutableRefObject } from "react"
import ipfsDownload, { fileDownload, fileDownloadUrl, ipfsDownloadUrl } from './ipfsDownload'
import kacheryCloudGetMutable from './kacheryCloudGetMutable'
import kacheryCloudStoreFile from './kacheryCloudStoreFile'
import { GetFigureDataResponse, GetFileDataRequest, GetFileDataResponse, GetFileDataUrlRequest, GetFileDataUrlResponse, GetMutableRequest, GetMutableResponse, InitiateTaskRequest, InitiateTaskResponse, isFigurlRequest, SetUrlStateRequest, SetUrlStateResponse, StoreFileRequest, StoreFileResponse, SubscribeToFeedRequest, SubscribeToFeedResponse } from "./viewInterface/FigurlRequestTypes"
import { MessageToChild, NewFeedMessagesMessage, TaskStatusUpdateMessage } from "./viewInterface/MessageToChildTypes"
import { isMessageToParent } from "./viewInterface/MessageToParentTypes"
(window as any).figurlFileData = {}

class FigureInterface {
    #taskManager: KacheryCloudTaskManager | undefined
    #taskJobs: {[key: string]: TaskJob<any>} = {}
    #feeds: {[key: string]: KacheryCloudFeed} = {}
    #closed = false
    #onRequestPermissionsCallback = (purpose: string) => {}
    #onSetUrlStateCallback = (state: {[key: string]: any}) => {}
    #authorizedPermissions = {
        'store-file': undefined as (boolean | undefined)
    }
    constructor(private a: {
        projectId: string | undefined,
        backendId: string | null,
        figureId: string,
        viewUrl: string,
        figureData: any,
        iframeElement: MutableRefObject<HTMLIFrameElement | null | undefined>,
        googleSignInClient: GoogleSignInClient,
        taskManager?: KacheryCloudTaskManager,
        localMode: boolean
    }) {
        this.#taskManager = a.taskManager
        window.addEventListener('message', e => {
            if (this.#closed) return
            const msg = e.data
            if (isMessageToParent(msg)) {
                if (msg.type === 'figurlRequest') {
                    if (msg.figureId === a.figureId) {
                        const requestId = msg.requestId
                        const request = msg.request
                        if (!isFigurlRequest(request)) return
                        if (request.type === 'getFigureData') {
                            const response: GetFigureDataResponse = {
                                type: 'getFigureData',
                                figureData: a.figureData
                            }
                            this._sendMessageToChild({
                                type: 'figurlResponse',
                                requestId,
                                response
                            })
                        }
                        else if (request.type === 'getFileData') {
                            this.handleGetFileDataRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'getFileDataUrl') {
                            this.handleGetFileDataUrlRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'initiateTask') {
                            this.handleInitiateTaskRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'subscribeToFeed') {
                            this.handleSubscribeToFeedRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'getMutable') {
                            this.handleGetMutableRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'storeFile') {
                            this.handleStoreFileRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'setUrlState') {
                            this.handleSetUrlState(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                    }
                }
            }
        })
        const updateSignedIn = () => {
            this._sendMessageToChild({
                type: 'setCurrentUser',
                userId: a.googleSignInClient.userId ? a.googleSignInClient.userId as any as UserId : undefined,
                googleIdToken: a.googleSignInClient.idToken || undefined
            })
        }
        a.googleSignInClient.onSignedInChanged(() => {
            updateSignedIn()
        })
        updateSignedIn()
    }
    close() {
        this.#closed = true
    }
    public get figureId() {
        return this.a.figureId
    }
    async authorizePermission(purpose: 'store-file', authorized: boolean) {
        this.#authorizedPermissions['store-file'] = authorized
        sleepMsec(400) // so we can be sure we've detected it
    }
    hasPermission(purpose: 'store-file') {
        return this.#authorizedPermissions['store-file'] || false
    }
    onRequestPermissions(callback: (purpose: string) => void) {
        this.#onRequestPermissionsCallback = callback
    }
    onSetUrlState(callback: (state: {[key: string]: any}) => void) {
        this.#onSetUrlStateCallback = callback
    }
    async handleGetFileDataRequest(request: GetFileDataRequest): Promise<GetFileDataResponse> {
        let {uri} = request
        const localMode = this.a.localMode
        let data
        const onProgress: (a: {loaded: number, total: number}) => void = ({loaded, total}) => {
            this._sendMessageToChild({
                type: 'fileDownloadProgress',
                uri,
                loaded,
                total
            })
        }
        if (uri.startsWith('ipfs://')) {
            if (localMode) throw Error('Cannot download ipfs file in local mode')
            const a = uri.split('?')[0].split('/')
            const cid = a[2]

            data = await ipfsDownload(cid)
        }
        else if (uri.startsWith('sha1://')) {
            const a = uri.split('?')[0].split('/')
            const sha1 = a[2]

            data = await fileDownload('sha1', sha1, onProgress, {localMode})
        }
        else if (uri.startsWith('putly://')) {
            const putlyKey = uri.split('?')[0].split('/')[2]
            const uri0 = await getPutly(putlyKey)
            if (!uri0) throw Error(`Unable to find putly key: ${putlyKey}`)
            if (!uri0.startsWith('sha1://')) {
                throw Error(`Invalid uri in putly value for key: ${putlyKey}`)
            }
            const a = uri.split('?')[0].split('/')
            const sha1 = a[2]
            data = await fileDownload('sha1', sha1, onProgress, {localMode})
        }
        else if (uri.startsWith('sha1-enc://')) {
            const a = uri.split('?')[0].split('/')
            const sha1_enc_path = a[2]

            data = await fileDownload('sha1-enc', sha1_enc_path, onProgress, {localMode})
        }
        else {
            throw Error(`Invalid uri: ${uri}`)
        }
        
        const dataDeserialized = await deserializeReturnValue(data)
        ;(window as any).figurlFileData[uri.toString()] = dataDeserialized
        return {
            type: 'getFileData',
            fileData: dataDeserialized
        }
    }
    async handleGetFileDataUrlRequest(request: GetFileDataUrlRequest): Promise<GetFileDataUrlResponse> {
        let {uri} = request
        if (uri.startsWith('ipfs://')) {
            const a = uri.split('?')[0].split('/')
            const cid = a[2]

            const url = await ipfsDownloadUrl(cid)
            if (!url) {
                throw Error('Unable to get ipfs download url')
            }
            return {
                type: 'getFileDataUrl',
                fileDataUrl: url
            }
        }
        else if (uri.startsWith('sha1://')) {
            const a = uri.split('?')[0].split('/')
            const sha1 = a[2]

            const url = await fileDownloadUrl('sha1', sha1)
            if (!url) {
                throw Error('Unable to get file download url')
            }
            return {
                type: 'getFileDataUrl',
                fileDataUrl: url
            }
        }
        else if (uri.startsWith('sha1-enc://')) {
            const a = uri.split('?')[0].split('/')
            const sha1_enc_path = a[2]

            const url = await fileDownloadUrl('sha1-enc', sha1_enc_path)
            if (!url) {
                throw Error('Unable to get file download url')
            }
            return {
                type: 'getFileDataUrl',
                fileDataUrl: url
            }
        }
        else {
            throw Error(`Invalid uri: ${uri}`)
        }
    }
    async handleInitiateTaskRequest(request: InitiateTaskRequest): Promise<InitiateTaskResponse> {
        if (!this.a.projectId) {
            throw Error('projectId cannot be empty for initiating a task request')
        }
        if (!this.#taskManager) {
            throw Error('not taskManager when initiating a task request')
        }
        const taskJob = this.#taskManager.runTask({taskType: request.taskType, taskName: request.taskName, taskInput: request.taskInput})
        if (!taskJob) throw Error('Unexpected: undefined task job')
        if (taskJob !== this.#taskJobs[taskJob.taskJobId.toString()]) {
            this.#taskJobs[taskJob.taskJobId.toString()] = taskJob
            const updateStatus = () => {
                const msg: TaskStatusUpdateMessage = {
                    type: 'taskStatusUpdate',
                    taskJobId: taskJob.taskJobId.toString(),
                    status: taskJob.status,
                    errorMessage: taskJob.errorMessage,
                    returnValue: taskJob.result
                }
                this._sendMessageToChild(msg)
            }
            taskJob.onStarted(updateStatus)
            taskJob.onFinished(updateStatus)
            taskJob.onError(updateStatus)
        }
        const response: InitiateTaskResponse = {
            type: 'initiateTask',
            taskJobId: taskJob.taskJobId.toString(),
            status: taskJob.status,
            errorMessage: taskJob.errorMessage,
            returnValue: taskJob.result,
            returnValueUrl: await taskJob.getReturnValueUrl()
        }
        return response
    }
    async handleSubscribeToFeedRequest(request: SubscribeToFeedRequest): Promise<SubscribeToFeedResponse> {
        const feed = kacheryCloudFeedManager.getFeed(request.feedId)
        if (!(request.feedId in this.#feeds)) {
            this.#feeds[request.feedId] = feed
            feed.onMessagesUpdated((startMessageNumber, messages) => {
                if (messages.length === 0) return
                const msg: NewFeedMessagesMessage = {
                    type: 'newFeedMessages',
                    feedId: request.feedId,
                    position: startMessageNumber,
                    messages: messages
                }
                this._sendMessageToChild(msg)
            })
        }
        const response: SubscribeToFeedResponse = {
            type: 'subscribeToFeed',
            messages: feed.getMessages()
        }
        return response
    }
    async handleGetMutableRequest(request: GetMutableRequest): Promise<GetMutableResponse> {
        if (!this.a.projectId) {
            throw Error('projectId cannot be empty for get mutable')
        }
        let {key} = request
        const value = await kacheryCloudGetMutable(key, this.a.projectId)
        return {
            type: 'getMutable',
            value: value !== undefined ? value : null
        }
    }
    async verifyPermissions(purpose: 'store-file') {
        if (this.#authorizedPermissions[purpose]) return true
        this.#onRequestPermissionsCallback('store-file')
        while (true) {
            if (this.#authorizedPermissions[purpose]) return true
            await sleepMsec(200)
        }
    }
    async handleStoreFileRequest(request: StoreFileRequest): Promise<StoreFileResponse> {
        if (!(await this.verifyPermissions('store-file'))) {
            return {
                type: 'storeFile',
                uri: undefined
            }
        }
        
        let {fileData} = request
        let uri = await kacheryCloudStoreFile(fileData)
        if (!uri) throw Error('Error storing file')
        if (request.putlyKey) {
            const uri2 = await setPutly(request.putlyKey, uri)
            if (!uri2) throw Error('Error storing in putly')
            uri = uri2
        }
        return {
            type: 'storeFile',
            uri
        }
    }
    async handleSetUrlState(request: SetUrlStateRequest): Promise<SetUrlStateResponse> {
        this.#onSetUrlStateCallback(request.state)
        return {
            type: 'setUrlState'
        }
    }
    _sendMessageToChild(msg: MessageToChild) {
        if (!this.a.iframeElement.current) {
            setTimeout(() => {
                // keep trying until iframe element exists
                this._sendMessageToChild(msg)
            }, 1000)
            return
        }
        const cw = this.a.iframeElement.current.contentWindow
        if (!cw) return
        cw.postMessage(msg, this.a.viewUrl)
    }
}

const putlyUrl = 'https://putly.vercel.app/api/putly'

export const getPutly = async (putlyKey: string) => {
    const request = {
        type: 'getPutly',
        putlyKey
    }
    const x = await axios.post(putlyUrl, request)
    if (x.data.type !== 'getPutly') {
        throw Error('Unexpected response in getPutly')
    }
    return x.data.value
}

export const setPutly = async (putlyKey: string, value: string) => {
    const request = {
        type: 'setPutly',
        putlyKey,
        value
    }
    const x = await axios.post(putlyUrl, request)
    if (x.data.type !== 'setPutly') {
        throw Error('Unexpected response in setPutly')
    }
    return `putly://${putlyKey}`
}

export default FigureInterface
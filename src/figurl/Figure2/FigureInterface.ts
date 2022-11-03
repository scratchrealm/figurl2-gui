import axios, { AxiosResponse } from 'axios'
import { JSONStringifyDeterministic, UserId } from 'commonInterface/kacheryTypes'
import GoogleSignInClient from 'components/googleSignIn/GoogleSignInClient'
import KacheryCloudFeed from 'kacheryCloudFeeds/KacheryCloudFeed'
import kacheryCloudFeedManager from 'kacheryCloudFeeds/kacheryCloudFeedManager'
import deserializeReturnValue from 'kacheryCloudTasks/deserializeReturnValue'
import KacheryCloudTaskManager from 'kacheryCloudTasks/KacheryCloudTaskManager'
import { sleepMsec } from 'kacheryCloudTasks/PubsubSubscription'
import TaskJob from 'kacheryCloudTasks/TaskJob'
import { MutableRefObject } from "react"
import { isLoadGistFileResponse, isLoadGithubFileResponse, isStoreGithubFileResponse, LoadGistFileRequest, LoadGithubFileRequest, StoreGithubFileRequest } from 'types/GithubRequest'
import ipfsDownload, { fileDownload, fileDownloadUrl, ipfsDownloadUrl } from './fileDownload'
import kacheryCloudGetMutable from './kacheryCloudGetMutable'
import kacheryCloudStoreFile from './kacheryCloudStoreFile'
import { GetFigureDataResponse, GetFileDataRequest, GetFileDataResponse, GetFileDataUrlRequest, GetFileDataUrlResponse, GetMutableRequest, GetMutableResponse, InitiateTaskRequest, InitiateTaskResponse, isFigurlRequest, SetUrlStateRequest, SetUrlStateResponse, StoreFileRequest, StoreFileResponse, StoreGithubFileRequest as StoreGithubFileRequestFigurl, StoreGithubFileResponse as StoreGithubFileResponseFigurl, SubscribeToFeedRequest, SubscribeToFeedResponse } from "./viewInterface/FigurlRequestTypes"
import { MessageToChild, NewFeedMessagesMessage, TaskStatusUpdateMessage } from "./viewInterface/MessageToChildTypes"
import { isMessageToParent } from "./viewInterface/MessageToParentTypes"
import zenodoDownload, { zenodoDownloadUrl } from './zenodoDownload'
(window as any).figurlFileData = {}

class FigureInterface {
    #taskManager: KacheryCloudTaskManager | undefined
    #taskJobs: {[key: string]: TaskJob<any>} = {}
    #feeds: {[key: string]: KacheryCloudFeed} = {}
    #closed = false
    #onRequestPermissionsCallback = (purpose: 'store-file' | 'store-github-file', params: any) => {}
    #onSetUrlStateCallback = (state: {[key: string]: any}) => {}
    #requestedFileUris: string[] = []
    #requestedFiles: {[uri: string]: {size?: number, name?: string}} = {}
    #authorizedPermissions: {[key: string]: boolean | undefined} = {}
    constructor(private a: {
        projectId: string | undefined,
        backendId: string | null,
        figureId: string,
        viewUrl: string,
        figureData: any,
        figureDataUri?: string,
        figureDataSize?: number,
        iframeElement: MutableRefObject<HTMLIFrameElement | null | undefined>,
        googleSignInClient: GoogleSignInClient,
        taskManager?: KacheryCloudTaskManager,
        localMode: boolean,
        kacheryGatewayUrl: string
    }) {
        if (a.figureDataUri) {
            this.#requestedFileUris.push(a.figureDataUri)
            this.#requestedFiles[a.figureDataUri] = {size: a.figureDataSize, name: 'root'}
        }

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
                        else if (request.type === 'storeGithubFile') {
                            this.handleStoreGithubFileRequest(request).then(response => {
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
    fileManifest() {
        const uris = this.#requestedFileUris
        const ret: {uri: string, name?: string, size?: number}[] = []
        for (let uri of uris) {
            ret.push({
                uri,
                name: this.#requestedFiles[uri].name,
                size: this.#requestedFiles[uri].size
            })
        }
        return ret
    }
    close() {
        this.#closed = true
    }
    public get figureId() {
        return this.a.figureId
    }
    async authorizePermission(purpose: 'store-file' | 'store-github-file', params: any, authorized: boolean | undefined) {
        const k = keyForAuthorizedPermissions(purpose, params)
        this.#authorizedPermissions[k] = authorized
        sleepMsec(400) // so we can be sure we've detected it
    }
    hasPermission(purpose: 'store-file' | 'store-github-file', params: any) {
        const k = keyForAuthorizedPermissions(purpose, params)
        return this.#authorizedPermissions[k]
    }
    onRequestPermissions(callback: (purpose: 'store-file' | 'store-github-file', params: any) => void) {
        this.#onRequestPermissionsCallback = callback
    }
    onSetUrlState(callback: (state: {[key: string]: any}) => void) {
        this.#onSetUrlStateCallback = callback
    }
    async handleGetFileDataRequest(request: GetFileDataRequest): Promise<GetFileDataResponse> {
        let {uri} = request
        if (!this.#requestedFiles[uri]) {
            this.#requestedFileUris.push(uri)
            this.#requestedFiles[uri] = {}
        }
        const localMode = this.a.localMode
        let data
        const onProgress: (a: {loaded: number, total: number}) => void = ({loaded, total}) => {
            this.#requestedFiles[uri].size = total
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

            data = await fileDownload('sha1', sha1, this.kacheryGatewayUrl, onProgress, {localMode})
        }
        else if (uri.startsWith('jot://')) {
            const jotId = uri.split('?')[0].split('/')[2]
            const uri0 = await getJotValue(jotId)
            if (!uri0) throw Error(`Unable to find jot: ${jotId}`)
            if (!uri0.startsWith('sha1://')) {
                throw Error(`Invalid uri in jot value for ID: ${jotId}`)
            }
            const a = uri0.split('?')[0].split('/')
            const sha1 = a[2]
            data = await fileDownload('sha1', sha1, this.kacheryGatewayUrl, onProgress, {localMode})
        }
        else if (uri.startsWith('gist://')) {
            data = await loadGistDataFromUri(uri)
        }
        else if (uri.startsWith('github://')) {
            data = await loadGithubFileDataFromUri(uri)
        }
        else if (uri.startsWith('sha1-enc://')) {
            const a = uri.split('?')[0].split('/')
            const sha1_enc_path = a[2]

            data = await fileDownload('sha1-enc', sha1_enc_path, this.kacheryGatewayUrl, onProgress, {localMode})
        }
        else if ((uri.startsWith('zenodo://')) || (uri.startsWith('zenodo-sandbox://'))) {
            const a = uri.split('?')[0].split('/')
            const recordId = a[2]
            const fileName = a.slice(3).join('/')
            data = await zenodoDownload(recordId, fileName, onProgress, {sandbox: uri.startsWith('zenodo-sandbox://')})
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
        if (!this.#requestedFiles[uri]) {
            this.#requestedFileUris.push(uri)
            this.#requestedFiles[uri] = {}
        }
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

            const {url, size} = await fileDownloadUrl('sha1', sha1, this.kacheryGatewayUrl) || {}
            if (!url) {
                throw Error('Unable to get file download url')
            }
            if (size) {
                this.#requestedFiles[uri].size = size
            }
            return {
                type: 'getFileDataUrl',
                fileDataUrl: url
            }
        }
        else if (uri.startsWith('sha1-enc://')) {
            const a = uri.split('?')[0].split('/')
            const sha1_enc_path = a[2]

            const {url, size} = await fileDownloadUrl('sha1-enc', sha1_enc_path, this.kacheryGatewayUrl) || {}
            if (!url) {
                throw Error('Unable to get file download url')
            }
            if (size) {
                this.#requestedFiles[uri].size = size
            }
            return {
                type: 'getFileDataUrl',
                fileDataUrl: url
            }
        }
        else if ((uri.startsWith('zenodo://')) || (uri.startsWith('zenodo-sandbox://'))) {
            const a = uri.split('?')[0].split('/')
            const recordId = a[2]
            const fileName = a.slice(3).join('/')
            const url = await zenodoDownloadUrl(recordId, fileName, {sandbox: uri.startsWith('zenodo-sandbox://')})
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
    async verifyPermissions(purpose: 'store-file' | 'store-github-file', params: any) {
        const k = `${purpose}.${JSONStringifyDeterministic(params)}`
        if (this.#authorizedPermissions[k] === true) return true
        this.#authorizedPermissions[k] = undefined
        this.#onRequestPermissionsCallback(purpose, params)
        while (true) {
            if (this.#authorizedPermissions[k] !== undefined) return this.#authorizedPermissions[k]
            await sleepMsec(200)
        }
    }
    async handleStoreFileRequest(request: StoreFileRequest): Promise<StoreFileResponse> {
        if (!(await this.verifyPermissions('store-file', {}))) {
            return {
                type: 'storeFile',
                uri: undefined
            }
        }
        
        let {fileData} = request
        let uri = await kacheryCloudStoreFile(fileData, this.kacheryGatewayUrl)
        if (!uri) throw Error('Error storing file')
        if (request.jotId) {
            if ((!this.a.googleSignInClient.userId) || (!this.a.googleSignInClient.idToken)) {
                throw Error('Unable to set jot value: not signed in')
            }
            const uri2 = await setJotValue(request.jotId, uri, {userId: this.a.googleSignInClient.userId, googleIdToken: this.a.googleSignInClient.idToken})
            if (!uri2) {
                return {
                    type: 'storeFile',
                    uri: undefined,
                    error: 'Problem setting jot value'
                }
            }
        }
        return {
            type: 'storeFile',
            uri
        }
    }
    async handleStoreGithubFileRequest(request: StoreGithubFileRequestFigurl): Promise<StoreGithubFileResponseFigurl> {
        let {fileData, uri} = request
        if (!(await this.verifyPermissions('store-github-file', {uri}))) {
            return {
                type: 'storeGithubFile',
                success: false,
                error: 'Permission not granted'
            }
        }
        const githubToken = getGithubTokenFromLocalStorage()
        if (!githubToken) {
            return {
                type: 'storeGithubFile',
                success: false,
                error: 'No github token'
            }
        }
        try {
            await storeGithubFile({fileData, uri, githubToken})
        }
        catch(err: any) {
            return {
                type: 'storeGithubFile',
                success: false,
                error: `Error storing github file: ${err.message}`
            }
        }
        return {
            type: 'storeGithubFile',
            success: true
        }
    }
    async handleSetUrlState(request: SetUrlStateRequest): Promise<SetUrlStateResponse> {
        this.#onSetUrlStateCallback(request.state)
        return {
            type: 'setUrlState'
        }
    }
    public get kacheryGatewayUrl() {
        return this.a.kacheryGatewayUrl
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

const jotUrl = 'https://jot.figurl.org/api/jot'

export const getJotValue = async (jotId: string) => {
    const request = {
        type: 'getJotValue',
        jotId
    }
    const x = await axios.post(jotUrl, request)
    if (x.data.type !== 'getJotValue') {
        throw Error('Unexpected response in getJotValue')
    }
    return x.data.value
}

export const setJotValue = async (jotId: string, value: string, o: {userId: string, googleIdToken: string}) => {
    const request = {
        type: 'setJotValue',
        jotId,
        value,
        userId: o.userId,
        googleIdToken: o.googleIdToken
    }
    let x: AxiosResponse
    try {
        x = await axios.post(jotUrl, request)
    }
    catch(err) {
        console.warn('Problem setting jot value', err)
        return undefined
    }
    if (x.data.type !== 'setJotValue') {
        throw Error('Unexpected response in setJotValue')
    }
    return `jot://${jotId}`
}

export const loadGistDataFromUri = async (uri: string) => {
    const parseGistUri = (uri: string) => {
        const a = uri.split('?')[0].split('/')
        if (a.length !== 5) {
            throw Error(`Invalid gist uri: ${uri}`)
        }
        return {
            userName: a[2],
            gistId: a[3],
            fileName: a[4]
        }
    }
    const loadGistFile = async ({userName, gistId, fileName}: {userName: string, gistId: string, fileName: string}) => {
        const req: LoadGistFileRequest = {
            type: 'loadGistFile',
            userName,
            gistId,
            fileName
        }
        const r = await axios.post('/api/github', req)
        const resp = r.data
        if (!isLoadGistFileResponse(resp)) {
            console.warn(resp)
            throw Error('Invalid loadGistFile response')
        }
        return resp.content
    }
    const {userName, gistId, fileName} = parseGistUri(uri)
    const contentText = await loadGistFile({userName, gistId, fileName})
    return JSON.parse(contentText)
}

const parseGithubFileUri = (uri: string) => {
    const a = uri.split('?')[0].split('/')
    if (a.length < 6) {
        throw Error(`Invalid github file uri: ${uri}`)
    }
    return {
        userName: a[2],
        repoName: a[3],
        branchName: a[4],
        fileName: a.slice(5).join('/')
    }
}

export const loadGithubFileDataFromUri = async (uri: string) => {
    const loadGithubFile = async ({userName, repoName, branchName, fileName}: {userName: string, repoName: string, branchName: string, fileName: string}) => {
        const req: LoadGithubFileRequest = {
            type: 'loadGithubFile',
            userName,
            repoName,
            branchName,
            fileName
        }
        const r = await axios.post('/api/github', req)
        const resp = r.data
        if (!isLoadGithubFileResponse(resp)) {
            console.warn(resp)
            throw Error('Invalid loadGithubFile response')
        }
        return resp.content
    }
    const {userName, repoName, branchName, fileName} = parseGithubFileUri(uri)
    const contentText = await loadGithubFile({userName, repoName, branchName, fileName})
    return JSON.parse(contentText)
}

const storeGithubFile = async ({fileData, uri, githubToken}: {fileData: string, uri: string, githubToken: string}) => {
    const {userName, repoName, branchName, fileName} = parseGithubFileUri(uri)
    const req: StoreGithubFileRequest = {
        type: 'storeGithubFile',
        userName,
        repoName,
        branchName,
        fileName,
        content: fileData,
        githubToken
    }
    const r = await axios.post('/api/github', req)
    const resp = r.data
    if (!isStoreGithubFileResponse(resp)) {
        console.warn(resp)
        throw Error('Invalid loadGithubFile response')
    }
    if (!resp.success) {
        throw Error(`Error storing github file: ${resp.error}`)
    }
}

export const setGithubTokenToLocalStorage = (token: string) => {
    localStorage.setItem('githubToken', JSON.stringify({
        token
    }))
}

export const getGithubTokenFromLocalStorage = () => {
    const a = localStorage.getItem('githubToken')
    if (!a) return undefined
    try {
        const b = JSON.parse(a)
        return b.token
    }
    catch {
        return undefined
    }
}

const keyForAuthorizedPermissions = (purpose: 'store-file' | 'store-github-file', params: any) => {
    return `${purpose}.${JSONStringifyDeterministic(params)}`
}

export default FigureInterface
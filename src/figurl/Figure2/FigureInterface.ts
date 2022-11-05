import axios, { AxiosResponse } from 'axios'
import { JSONStringifyDeterministic, UserId } from 'commonInterface/kacheryTypes'
import GoogleSignInClient from 'components/googleSignIn/GoogleSignInClient'
import KacheryCloudFeed from 'kacheryCloudFeeds/KacheryCloudFeed'
import kacheryCloudFeedManager from 'kacheryCloudFeeds/kacheryCloudFeedManager'
import deserializeReturnValue from 'kacheryCloudTasks/deserializeReturnValue'
import KacheryCloudTaskManager from 'kacheryCloudTasks/KacheryCloudTaskManager'
import { sleepMsec } from 'kacheryCloudTasks/PubsubSubscription'
import TaskJob from 'kacheryCloudTasks/TaskJob'
import { Octokit } from 'octokit'
import { MutableRefObject } from "react"
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
        let {uri, responseType} = request
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

            data = await fileDownload('sha1', sha1, this.kacheryGatewayUrl, onProgress, {localMode, parseJson: (responseType !== 'text')})
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
            data = await fileDownload('sha1', sha1, this.kacheryGatewayUrl, onProgress, {localMode, parseJson: (responseType !== 'text')})
        }
        else if (uri.startsWith('gh://')) {
            const {content} = await loadGithubFileDataFromUri(uri)
            if (responseType === 'text') {
                data = content
            }
            else {
                data = JSON.parse(content)
            }
        }
        else if (uri.startsWith('sha1-enc://')) {
            const a = uri.split('?')[0].split('/')
            const sha1_enc_path = a[2]

            data = await fileDownload('sha1-enc', sha1_enc_path, this.kacheryGatewayUrl, onProgress, {localMode, parseJson: (responseType !== 'text')})
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
        
        let dataDeserialized = data
        if ((responseType || 'json-deserialized') === 'json-deserialized') {
            dataDeserialized = await deserializeReturnValue(data)
        }
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
        if (!uri.startsWith('gh://')) {
            throw Error(`Invalid github URI: ${uri}`)
        }
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
            await storeGithubFile({fileData, uri})
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

/*
This is important because there is a lag between when gh refs are changed
via the gh api and when those changes take effect for content requests.
A lot more could be said about this... but the upshot is:
When an individual user saves their work and reloads the page, they will see everything updated properly (even though gh hasn't sync'd yet), because things are loading from local cache.
But a user on a different browser will experience a delay before seeing the changes. (they will need to refresh the page)
Subsequent commits for the original user will work, even if gh has not yet synced.
However, if a second user tries to make a commit without reloading the updated page it will fail.
*/
type ILGCRecord = {
    // records an event where we set the content
    timestamp: number
    newSha: string
    newContent: string
    oldShas: string[] // important to keep track of these
}
type ImportantLocalGithubCache = {
    [key: string]: ILGCRecord
}
const getImportantLocalGithubCache = (): ImportantLocalGithubCache => {
    try {
        return JSON.parse(localStorage.getItem('important-local-github-cache-v1') || '{}')
    }
    catch(err) {
        return {}
    }
}
const setImportantLocalGithubCache = (x: ImportantLocalGithubCache) => {
    localStorage.setItem('important-local-github-cache-v1', JSON.stringify(x))
}
const formKey = (user: string, repo: string, branch: string, file: string) => {
    return `${user}/${repo}/${branch}/${file}`
}
const getILGCRecord = (user: string, repo: string, branch: string, file: string): ILGCRecord | undefined => {
    const cc = getImportantLocalGithubCache()
    return cc[formKey(user, repo, branch, file)]
}
const setILGCRecord = (user: string, repo: string, branch: string, file: string, record: ILGCRecord) => {
    const cc = getImportantLocalGithubCache()
    cc[formKey(user, repo, branch, file)] = record
    setImportantLocalGithubCache(cc)
}
const deleteIlgcRecord = (user: string, repo: string, branch: string, file: string) => {
    const cc = getImportantLocalGithubCache()
    delete cc[formKey(user, repo, branch, file)]
    setImportantLocalGithubCache(cc)
}
const cleanupILGC = () => {
    const cc = getImportantLocalGithubCache()
    const keys = Object.keys(cc)
    for (let k of keys) {
        const elapsed = Date.now() - cc[k].timestamp
        if (elapsed >= 1000 * 60 * 10) {
            delete cc[k]
        }
    }
    setImportantLocalGithubCache(cc)
}
cleanupILGC() // do it once on start
/////////////////////////////////////////////////////////////////////////////////



export const loadGithubFileDataFromUri = async (uri: string): Promise<{content: string, sha: string}> => {
    console.info(`Github: ${uri.slice('gh://'.length)}`)

    const {userName, repoName, branchName, fileName} = parseGithubFileUri(uri)

    const githubToken = getGithubTokenFromLocalStorage()
    const octokit = new Octokit({
        auth: githubToken
    })
    
    const rr = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: userName,
        repo: repoName,
        path: fileName,
        ref: branchName
    })
    if (rr.status !== 200) {
        throw Error(`Problem loading file ${uri}: (${rr.status})`)
    }
    const content1: string = (rr.data as any).content
    const buf = Buffer.from(content1, 'base64')
    const content = buf.toString('utf-8')
    const sha = (rr.data as any).sha

    try {
        const ilgcRecord = getILGCRecord(userName, repoName, branchName, fileName)
        if (ilgcRecord) {
            if (ilgcRecord.newSha === sha) {
                // we are good - we have the new content
                deleteIlgcRecord(userName, repoName, branchName, fileName)
            }
            else if ((ilgcRecord.oldShas || []).includes(sha)) {
                // We most likely have old content (rather than content coming externally). So, let's return the new content.
                console.info('WARNING: returning locally cached github content', ilgcRecord.newSha)
                return {
                    content: ilgcRecord.newContent,
                    sha: ilgcRecord.newSha
                }
            }
        }
    }
    catch(err) {
        console.warn(err)
        console.warn('Problem with ILGC')
    }

    return {content, sha}
}

const storeGithubFile = async ({fileData, uri}: {fileData: string, uri: string}) => {
    const {userName, repoName, branchName, fileName} = parseGithubFileUri(uri)

    let existingFileData: string | undefined
    let existingSha: string | undefined
    try {
        // note that this will include the cached newest version if relevant
        // which is important for when we pass in the existingSha below
        const aa = await loadGithubFileDataFromUri(uri)
        existingFileData = aa.content
        existingSha = aa.sha
    }
    catch {
        existingFileData = undefined
        existingSha = undefined
    }

    if (existingFileData) {
        if (existingFileData === fileData) {
            // no need to update
            return
        }
    }

    const githubToken = getGithubTokenFromLocalStorage()
    const octokit = new Octokit({
        auth: githubToken
    })

    const r = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: userName,
        repo: repoName,
        path: fileName,
        message: `Set ${fileName}`,
        content: Buffer.from(fileData).toString('base64'),
        branch: branchName,
        sha: existingSha
    })
    const newSha = (r.data as any).content.sha

    try {
        if (existingSha) { // only worry about this if we are replacing existing content
            let ilgcRecord = getILGCRecord(userName, repoName, branchName, fileName)
            ilgcRecord = {
                timestamp: Date.now(),
                newContent: fileData,
                newSha,
                oldShas: ilgcRecord ? [...(ilgcRecord.oldShas || []), existingSha] : [existingSha]
            }
            setILGCRecord(userName, repoName, branchName, fileName, ilgcRecord)
        }
    }
    catch(err) {
        console.warn(err)
        console.warn('Problem with ILGC')
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
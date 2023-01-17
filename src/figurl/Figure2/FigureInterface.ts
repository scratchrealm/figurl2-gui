import axios, { AxiosResponse } from 'axios'
import { isString, JSONStringifyDeterministic } from 'commonInterface/kacheryTypes'
import { initialGithubAuth } from 'GithubAuth/useSetupGithubAuth'
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
import validateObject, { isBoolean, isNumber, optional } from './viewInterface/validateObject'
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
    #githubAuth: {userId?: string, accessToken?: string} = initialGithubAuth
    #figureData: any | undefined = undefined
    constructor(private a: {
        projectId: string | undefined,
        backendId: string | null,
        figureId: string,
        viewUrl: string,
        figureDataUri?: string,
        figureDataSize?: number,
        iframeElement: MutableRefObject<HTMLIFrameElement | null | undefined>,
        taskManager?: KacheryCloudTaskManager,
        localMode: boolean,
        kacheryGatewayUrl: string,
        zone: string
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
                    if ((msg.figureId === a.figureId) || (msg.figureId === 'undefined')) {
                        const requestId = msg.requestId
                        const request = msg.request
                        if (!isFigurlRequest(request)) {
                            console.warn(request)
                            console.warn('Not a figurl request')
                            return
                        }
                        if (request.type === 'getFigureData') {
                            this._waitForFigureData().then(() => {
                                const response: GetFigureDataResponse = {
                                    type: 'getFigureData',
                                    figureData: this.#figureData
                                }
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
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
    }
    setFigureData(x: any) {
        this.#figureData = x
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

        try {
            if (uri.startsWith('ipfs://')) {
                if (localMode) throw Error('Cannot download ipfs file in local mode')
                const a = uri.split('?')[0].split('/')
                const cid = a[2]

                data = await ipfsDownload(cid)
            }
            else if (uri.startsWith('sha1://')) {
                const a = uri.split('?')[0].split('/')
                const sha1 = a[2]

                data = await fileDownload('sha1', sha1, this.kacheryGatewayUrl, onProgress, this.githubAuth, this.a.zone, {localMode, parseJson: (responseType !== 'text')})
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
                data = await fileDownload('sha1', sha1, this.kacheryGatewayUrl, onProgress, this.githubAuth, this.a.zone, {localMode, parseJson: (responseType !== 'text')})
            }
            else if (uri.startsWith('gh://')) {
                const {content} = await loadGitHubFileDataFromUri(uri)
                const {fileName} = parseGitHubFileUri(uri)
                if (fileName.endsWith('.uri')) {
                    if ((content.startsWith('sha1://'))) {
                        const uri2 = content
                        const a = uri2.split('?')[0].split('/')
                        const sha1 = a[2]

                        data = await fileDownload('sha1', sha1, this.kacheryGatewayUrl, onProgress, this.githubAuth, this.a.zone, {localMode, parseJson: (responseType !== 'text')})
                    }
                    else throw Error(`Unexpected content for .uri file ${uri} (expected a URI)`)
                }
                else {
                    if (responseType === 'text') {
                        data = content
                    }
                    else {
                        data = JSON.parse(content)
                    }
                }
            }
            else if (uri.startsWith('sha1-enc://')) {
                const a = uri.split('?')[0].split('/')
                const sha1_enc_path = a[2]

                data = await fileDownload('sha1-enc', sha1_enc_path, this.kacheryGatewayUrl, onProgress, this.githubAuth, this.a.zone, {localMode, parseJson: (responseType !== 'text')})
            }
            else if ((uri.startsWith('zenodo://')) || (uri.startsWith('zenodo-sandbox://'))) {
                const a = uri.split('?')[0].split('/')
                const recordId = a[2]
                const fileName = a.slice(3).join('/')
                const dataJson = await zenodoDownload(recordId, fileName, onProgress, {sandbox: uri.startsWith('zenodo-sandbox://')})
                try {
                    data = JSON.parse(dataJson)
                }
                catch {
                    console.warn(dataJson)
                    throw Error('Problem parsing JSON')
                }
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
        catch(err: any) {
            console.warn(err)
            console.warn(`Error getting file data for ${uri}`)
            return {
                type: 'getFileData',
                errorMessage: err.message
            }
        }
    }
    async handleGetFileDataUrlRequest(request: GetFileDataUrlRequest): Promise<GetFileDataUrlResponse> {
        let {uri} = request
        if (!this.#requestedFiles[uri]) {
            this.#requestedFileUris.push(uri)
            this.#requestedFiles[uri] = {}
        }
        try {
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

                const {url, size} = await fileDownloadUrl('sha1', sha1, this.kacheryGatewayUrl, this.#githubAuth, this.a.zone) || {}
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

                const {url, size} = await fileDownloadUrl('sha1-enc', sha1_enc_path, this.kacheryGatewayUrl, this.githubAuth, this.a.zone) || {}
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
        catch(err: any) {
            console.warn(err)
            console.warn(`Error getting file URL for ${uri}`)
            return {
                type: 'getFileDataUrl',
                errorMessage: err.message
            }
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
        let uri = await kacheryCloudStoreFile(fileData, this.kacheryGatewayUrl, this.githubAuth, this.a.zone)
        if (!uri) throw Error('Error storing file')
        if (request.jotId) {
            if ((!this.#githubAuth.userId) || (!this.#githubAuth.accessToken)) {
                throw Error('Unable to set jot value: not signed in')
            }
            const uri2 = await setJotValue(request.jotId, uri, {userId: this.#githubAuth.userId, accessToken: this.#githubAuth.accessToken})
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
        async function storeHelper(uri: string, fileData: any): Promise<StoreGithubFileResponseFigurl> {
            const githubTokenInfo = getGitHubTokenInfoFromLocalStorage()
            if (!githubTokenInfo?.token) {
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
        const {fileName} = parseGitHubFileUri(uri)
        if (fileName.endsWith('.uri')) {
            // store file in kachery-cloud, get the URI and store that on github (because the file ends with .uri)
            const {uri: uri2} = await this.handleStoreFileRequest({type: 'storeFile', fileData})
            return await storeHelper(uri, uri2)
        }
        else {
            return await storeHelper(uri, fileData)
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
    setGithubAuth(userId?: string, accessToken?: string) {
        if ((userId === this.#githubAuth.userId) && (accessToken === this.#githubAuth.accessToken)) {
            // stop reference cycle, react hooks
            return
        }
        this.#githubAuth = {userId, accessToken}
    }
    public get githubAuth() {
        return this.#githubAuth // important to return the reference - for react hook reasons
    }
    async _waitForFigureData() {
        while (true) {
            if (this.#figureData) {
                return
            }
            await sleepMsec(100)
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
        const targetOrigin = isZenodoViewUrl(this.a.viewUrl) ? window.location.protocol + '//' + window.location.host : this.a.viewUrl
        cw.postMessage(msg, targetOrigin)
    }
}

export const isZenodoViewUrl = (url: string) => {
    return url.startsWith('zenodo://') || url.startsWith('zenodo-sandbox://')
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

export const setJotValue = async (jotId: string, value: string, o: {userId: string, accessToken: string}) => {
    const request = {
        type: 'setJotValue',
        jotId,
        value,
        userId: o.userId,
        accessToken: o.accessToken
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

const parseGitHubFileUri = (uri: string) => {
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
type ImportantLocalGitHubCache = {
    [key: string]: ILGCRecord
}
const getImportantLocalGitHubCache = (): ImportantLocalGitHubCache => {
    try {
        return JSON.parse(localStorage.getItem('important-local-github-cache-v1') || '{}')
    }
    catch(err) {
        return {}
    }
}
const setImportantLocalGitHubCache = (x: ImportantLocalGitHubCache) => {
    localStorage.setItem('important-local-github-cache-v1', JSON.stringify(x))
}
const formKey = (user: string, repo: string, branch: string, file: string) => {
    return `${user}/${repo}/${branch}/${file}`
}
const getILGCRecord = (user: string, repo: string, branch: string, file: string): ILGCRecord | undefined => {
    const cc = getImportantLocalGitHubCache()
    return cc[formKey(user, repo, branch, file)]
}
const setILGCRecord = (user: string, repo: string, branch: string, file: string, record: ILGCRecord) => {
    const cc = getImportantLocalGitHubCache()
    cc[formKey(user, repo, branch, file)] = record
    setImportantLocalGitHubCache(cc)
}
const deleteIlgcRecord = (user: string, repo: string, branch: string, file: string) => {
    const cc = getImportantLocalGitHubCache()
    delete cc[formKey(user, repo, branch, file)]
    setImportantLocalGitHubCache(cc)
}
const cleanupILGC = () => {
    const cc = getImportantLocalGitHubCache()
    const keys = Object.keys(cc)
    for (let k of keys) {
        const elapsed = Date.now() - cc[k].timestamp
        if (elapsed >= 1000 * 60 * 10) {
            delete cc[k]
        }
    }
    setImportantLocalGitHubCache(cc)
}
cleanupILGC() // do it once on start
/////////////////////////////////////////////////////////////////////////////////



export const loadGitHubFileDataFromUri = async (uri: string): Promise<{content: string, sha: string}> => {
    console.info(`GitHub: ${uri.slice('gh://'.length)}`)

    const {userName, repoName, branchName, fileName} = parseGitHubFileUri(uri)

    const githubInfoToken = getGitHubTokenInfoFromLocalStorage()
    const octokit = new Octokit({
        auth: githubInfoToken?.token
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
    const {userName, repoName, branchName, fileName} = parseGitHubFileUri(uri)

    let existingFileData: string | undefined
    let existingSha: string | undefined
    try {
        // note that this will include the cached newest version if relevant
        // which is important for when we pass in the existingSha below
        const aa = await loadGitHubFileDataFromUri(uri)
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

    const githubTokenInfo = getGitHubTokenInfoFromLocalStorage()
    const octokit = new Octokit({
        auth: githubTokenInfo?.token
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

export type GitHubTokenInfo = {
    token?: string
    userId?: string
    userIdTimestamp?: number
    isPersonalAccessToken?: boolean
}

export const isGithubTokenInfo = (x: any): x is GitHubTokenInfo => {
    return validateObject(x, {
        token: optional(isString),
        userId: optional(isString),
        userIdTimestamp: optional(isNumber),
        isPersonalAccessToken: optional(isBoolean)
    })
}

export const setGitHubTokenInfoToLocalStorage = (tokenInfo: GitHubTokenInfo) => {
    localStorage.setItem('githubToken', JSON.stringify(tokenInfo))
}

export const getGitHubTokenInfoFromLocalStorage = (): GitHubTokenInfo | undefined => {
    const a = localStorage.getItem('githubToken')
    if (!a) return undefined
    try {
        const b = JSON.parse(a)
        if (isGithubTokenInfo(b)) {
            return b
        }
        else {
            console.warn(b)
            console.warn('Invalid GitHub token info.')
            localStorage.removeItem('githubToken')
            return undefined
        }
    }
    catch {
        console.warn(a)
        console.warn('Error with github token info.')
        return undefined
    }
}

const keyForAuthorizedPermissions = (purpose: 'store-file' | 'store-github-file', params: any) => {
    return `${purpose}.${JSONStringifyDeterministic(params)}`
}

export default FigureInterface
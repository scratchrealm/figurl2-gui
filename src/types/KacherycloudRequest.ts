import { isArrayOf, isBoolean, isEqualTo, isJSONObject, isNodeId, isNumber, isOneOf, isSha1Hash, isSignature, isString, JSONObject, NodeId, optional, Sha1Hash, Signature, _validateObject } from "../commonInterface/kacheryTypes"
import { Client, isClient } from "./Client"
import { isProject, Project } from "./Project"
import { isProjectMembership, ProjectMembership } from "./ProjectMembership"
import { isPubsubChannelName, isPubsubMessage, PubsubChannelName, PubsubMessage } from "./PubsubMessage"
import { isUserSettings, UserSettings } from "./User"

//////////////////////////////////////////////////////////////////////////////////
// getClientInfo

export type GetClientInfoRequest = {
    payload: {
        type: 'getClientInfo'
        timestamp: number
        clientId: NodeId
    }
    fromClientId: NodeId
    signature: Signature
}

export const isGetClientInfoRequest = (x: any): x is GetClientInfoRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('getClientInfo'),
            timestamp: isNumber,
            clientId: isNodeId
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type GetClientInfoResponse = {
    type: 'getClientInfo'
    found: boolean
    client?: Client
    projects?: Project[]
    projectMemberships?: ProjectMembership[]
    userSettings?: UserSettings
}

export const isGetClientInfoResponse = (x: any): x is GetClientInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('getClientInfo'),
        found: isBoolean,
        client: optional(isClient),
        projects: optional(isArrayOf(isProject)),
        projectMemberships: optional(isArrayOf(isProjectMembership)),
        userSettings: optional(isUserSettings)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getProjectBucketBaseUrl

export type GetProjectBucketBaseUrlRequest = {
    payload: {
        type: 'getProjectBucketBaseUrl'
        timestamp: number
        projectId: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isGetProjectBucketBaseUrlRequest = (x: any): x is GetProjectBucketBaseUrlRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('getProjectBucketBaseUrl'),
            timestamp: isNumber,
            projectId: isString
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type GetProjectBucketBaseUrlResponse = {
    type: 'getProjectBucketBaseUrl'
    found: boolean
    projectBaseUrl?: string
}

export const isGetProjectBucketBaseUrlResponse = (x: any): x is GetProjectBucketBaseUrlResponse => {
    return _validateObject(x, {
        type: isEqualTo('getProjectBucketBaseUrl'),
        found: isBoolean,
        projectBaseUrl: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// accessGroupEncrypt

export type AccessGroupEncryptRequest = {
    payload: {
        type: 'accessGroupEncrypt'
        timestamp: number
        accessGroupId: string
        text: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isAccessGroupEncryptRequest = (x: any): x is AccessGroupEncryptRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('accessGroupEncrypt'),
            timestamp: isNumber,
            accessGroupId: isString,
            text: isString
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type AccessGroupEncryptResponse = {
    type: 'accessGroupEncrypt'
    encryptedText: string
}

export const isAccessGroupEncryptResponse = (x: any): x is AccessGroupEncryptResponse => {
    return _validateObject(x, {
        type: isEqualTo('accessGroupEncrypt'),
        encryptedText: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// accessGroupEncrypt

export type AccessGroupDecryptRequest = {
    payload: {
        type: 'accessGroupDecrypt'
        timestamp: number
        accessGroupId: string
        encryptedText: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isAccessGroupDecryptRequest = (x: any): x is AccessGroupDecryptRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('accessGroupDecrypt'),
            timestamp: isNumber,
            accessGroupId: isString,
            encryptedText: isString
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type AccessGroupDecryptResponse = {
    type: 'accessGroupDecrypt'
    decryptedText: string
}

export const isAccessGroupDecryptResponse = (x: any): x is AccessGroupDecryptResponse => {
    return _validateObject(x, {
        type: isEqualTo('accessGroupDecrypt'),
        decryptedText: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// initiateIpfsUpload

export type InitiateIpfsUploadRequest = {
    payload: {
        type: 'initiateIpfsUpload'
        timestamp: number
        size: number
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isInitiateIpfsUploadRequest = (x: any): x is InitiateIpfsUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('initiateIpfsUpload'),
            timestamp: isNumber,
            size: isNumber,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type InitiateIpfsUploadResponse = {
    type: 'initiateIpfsUpload'
    signedUploadUrl: string
    objectKey: string
}

export const isInitiateIpfsUploadResponse = (x: any): x is InitiateIpfsUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('initiateIpfsUpload'),
        signedUploadUrl: isString,
        objectKey: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// finalizeIpfsUpload

export type FinalizeIpfsUploadRequest = {
    payload: {
        type: 'finalizeIpfsUpload'
        timestamp: number
        objectKey: string
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isFinalizeIpfsUploadRequest = (x: any): x is FinalizeIpfsUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('finalizeIpfsUpload'),
            timestamp: isNumber,
            objectKey: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type FinalizeIpfsUploadResponse = {
    type: 'finalizeIpfsUpload'
    cid: string
}

export const isFinalizeIpfsUploadResponse = (x: any): x is FinalizeIpfsUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('finalizeIpfsUpload'),
        cid: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// findIpfsFile

export type FindIpfsFileRequest = {
    payload: {
        type: 'findIpfsFile'
        timestamp: number
        cid: string
        projectId?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isFindIpfsFileRequest = (x: any): x is FindIpfsFileRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('findIpfsFile'),
            timestamp: isNumber,
            cid: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type FindIpfsFileResponse = {
    type: 'findIpfsFile'
    found: boolean
    projectId?: string
    size?: number
    url?: string
}

export const isFindIpfsFileResponse = (x: any): x is FindIpfsFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('findIpfsFile'),
        found: isBoolean,
        projectId: optional(isString),
        size: optional(isNumber),
        url: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// initiateFileUpload

export type InitiateFileUploadRequest = {
    payload: {
        type: 'initiateFileUpload'
        timestamp: number
        size: number
        hashAlg: 'sha1'
        hash: string
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isInitiateFileUploadRequest = (x: any): x is InitiateFileUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('initiateFileUpload'),
            timestamp: isNumber,
            size: isNumber,
            hashAlg: isOneOf(['sha1'].map(a => (isEqualTo(a)))),
            hash: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type InitiateFileUploadResponse = {
    type: 'initiateFileUpload'
    alreadyExists?: boolean
    objectKey?: string
    signedUploadUrl?: string
    alreadyPending?: boolean
}

export const isInitiateFileUploadResponse = (x: any): x is InitiateFileUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('initiateFileUpload'),
        alreadyExists: optional(isBoolean),
        objectKey: optional(isString),
        signedUploadUrl: optional(isString),
        alreadyPending: optional(isBoolean)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// finalizeFileUpload

export type FinalizeFileUploadRequest = {
    payload: {
        type: 'finalizeFileUpload'
        timestamp: number
        objectKey: string
        hashAlg: 'sha1'
        hash: string
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isFinalizeFileUploadRequest = (x: any): x is FinalizeFileUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('finalizeFileUpload'),
            timestamp: isNumber,
            objectKey: isString,
            hashAlg: isOneOf(['sha1'].map(a => (isEqualTo(a)))),
            hash: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type FinalizeFileUploadResponse = {
    type: 'finalizeFileUpload'
}

export const isFinalizeFileUploadResponse = (x: any): x is FinalizeFileUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('finalizeFileUpload')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// findFile

export type FindFileRequest = {
    payload: {
        type: 'findFile'
        timestamp: number
        hashAlg: string
        hash: string
        projectId?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isFindFileRequest = (x: any): x is FindFileRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('findFile'),
            timestamp: isNumber,
            hashAlg: isString,
            hash: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type FindFileResponse = {
    type: 'findFile'
    found: boolean
    projectId?: string
    size?: number
    url?: string
}

export const isFindFileResponse = (x: any): x is FindFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('findFile'),
        found: isBoolean,
        projectId: optional(isString),
        size: optional(isNumber),
        url: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setMutable

export type SetMutableRequest = {
    payload: {
        type: 'setMutable'
        timestamp: number
        mutableKey: string
        value: string
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isSetMutableRequest = (x: any): x is SetMutableRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('setMutable'),
            timestamp: isNumber,
            mutableKey: isString,
            value: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type SetMutableResponse = {
    type: 'setMutable'
    projectId: string
}

export const isSetMutableResponse = (x: any): x is SetMutableResponse => {
    return _validateObject(x, {
        type: isEqualTo('setMutable'),
        projectId: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getMutable

export type GetMutableRequest = {
    payload: {
        type: 'getMutable'
        timestamp: number
        mutableKey: string
        projectId?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isGetMutableRequest = (x: any): x is GetMutableRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('getMutable'),
            timestamp: isNumber,
            mutableKey: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type GetMutableResponse = {
    type: 'getMutable'
    found: boolean
    value?: string
    projectId?: string
}

export const isGetMutableResponse = (x: any): x is GetMutableResponse => {
    return _validateObject(x, {
        type: isEqualTo('getMutable'),
        found: isBoolean,
        value: optional(isString),
        projectId: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// initiateTaskResultUpload

export type InitiateTaskResultUploadRequest = {
    payload: {
        type: 'initiateTaskResultUpload'
        timestamp: number
        taskName: string
        taskJobId: Sha1Hash
        size: number
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isInitiateTaskResultUploadRequest = (x: any): x is InitiateTaskResultUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('initiateTaskResultUpload'),
            timestamp: isNumber,
            taskName: isString,
            taskJobId: isSha1Hash,
            size: isNumber,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type InitiateTaskResultUploadResponse = {
    type: 'initiateTaskResultUpload'
    signedUploadUrl: string
}

export const isInitiateTaskResultUploadResponse = (x: any): x is InitiateTaskResultUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('initiateTaskResultUpload'),
        signedUploadUrl: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// finalizeTaskResultUpload

export type FinalizeTaskResultUploadRequest = {
    payload: {
        type: 'finalizeTaskResultUpload'
        timestamp: number
        taskName: string
        taskJobId: Sha1Hash
        size: number
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isFinalizeTaskResultUploadRequest = (x: any): x is FinalizeTaskResultUploadRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('finalizeTaskResultUpload'),
            timestamp: isNumber,
            taskName: isString,
            taskJobId: isSha1Hash,
            size: isNumber,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type FinalizeTaskResultUploadResponse = {
    type: 'finalizeTaskResultUpload'
}

export const isFinalizeTaskResultUploadResponse = (x: any): x is FinalizeTaskResultUploadResponse => {
    return _validateObject(x, {
        type: isEqualTo('finalizeTaskResultUpload')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// subscribeToPubsubChannel

export type SubscribeToPubsubChannelRequest = {
    payload: {
        type: 'subscribeToPubsubChannel'
        timestamp: number
        channelName: PubsubChannelName
        projectId?: string
        uuid?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isSubscribeToPubsubChannelRequest = (x: any): x is SubscribeToPubsubChannelRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('subscribeToPubsubChannel'),
            timestamp: isNumber,
            channelName: isPubsubChannelName,
            projectId: optional(isString),
            uuid: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type SubscribeToPubsubChannelResponse = {
    type: 'subscribeToPubsubChannel'
    token: string
    subscribeKey: string
    uuid: string
    pubsubChannelName: string
}

export const isSubscribeToPubsubChannelResponse = (x: any): x is SubscribeToPubsubChannelResponse => {
    return _validateObject(x, {
        type: isEqualTo('subscribeToPubsubChannel'),
        token: isString,
        subscribeKey: isString,
        uuid: isString,
        pubsubChannelName: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// publishToPubsubChannel

export type PublishToPubsubChannelRequest = {
    payload: {
        type: 'publishToPubsubChannel'
        timestamp: number
        channelName: PubsubChannelName
        message: PubsubMessage
        projectId?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isPublishToPubsubChannelRequest = (x: any): x is PublishToPubsubChannelRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('publishToPubsubChannel'),
            timestamp: isNumber,
            channelName: isPubsubChannelName,
            message: isPubsubMessage,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type PublishToPubsubChannelResponse = {
    type: 'publishToPubsubChannel'
}

export const isPublishToPubsubChannelResponse = (x: any): x is PublishToPubsubChannelResponse => {
    return _validateObject(x, {
        type: isEqualTo('publishToPubsubChannel')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// createFeed

export type CreateFeedRequest = {
    payload: {
        type: 'createFeed'
        timestamp: number
        projectId?: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isCreateFeedRequest = (x: any): x is CreateFeedRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('createFeed'),
            timestamp: isNumber,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type CreateFeedResponse = {
    type: 'createFeed'
    feedId: string
    projectId: string
}

export const isCreateFeedResponse = (x: any): x is CreateFeedResponse => {
    return _validateObject(x, {
        type: isEqualTo('createFeed'),
        feedId: isString,
        projectId: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getFeedInfo

export type GetFeedInfoRequest = {
    payload: {
        type: 'getFeedInfo'
        timestamp: number
        feedId: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isGetFeedInfoRequest = (x: any): x is GetFeedInfoRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('getFeedInfo'),
            timestamp: isNumber,
            feedId: isString
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type GetFeedInfoResponse = {
    type: 'getFeedInfo'
    projectId: string
}

export const isGetFeedInfoResponse = (x: any): x is GetFeedInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('getFeedInfo'),
        projectId: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// appendFeedMessages

export type AppendFeedMessagesRequest = {
    payload: {
        type: 'appendFeedMessages'
        timestamp: number
        feedId: string
        messagesJson: string[] // we send the JSON contents to avoid ambiguity with the signature
    }
    fromClientId: NodeId
    signature: Signature
}

export const isAppendFeedMessagesRequest = (x: any): x is AppendFeedMessagesRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('appendFeedMessages'),
            timestamp: isNumber,
            feedId: isString,
            messagesJson: isArrayOf(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: isNodeId,
        signature: isSignature
    })
}

export type AppendFeedMessagesResponse = {
    type: 'appendFeedMessages'
}

export const isAppendFeedMessagesResponse = (x: any): x is AppendFeedMessagesResponse => {
    return _validateObject(x, {
        type: isEqualTo('appendFeedMessages')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getFeedMessages

export type GetFeedMessagesRequest = {
    payload: {
        type: 'getFeedMessages'
        timestamp: number
        feedId: string
        startMessageNumber: number
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isGetFeedMessagesRequest = (x: any): x is GetFeedMessagesRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('getFeedMessages'),
            timestamp: isNumber,
            feedId: isString,
            startMessageNumber: isNumber
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type GetFeedMessagesResponse = {
    type: 'getFeedMessages'
    messages: JSONObject[]
    startMessageNumber: number
}

export const isGetFeedMessagesResponse = (x: any): x is GetFeedMessagesResponse => {
    return _validateObject(x, {
        type: isEqualTo('getFeedMessages'),
        messages: isArrayOf(isJSONObject),
        startMessageNumber: isNumber
    })
}

//////////////////////////////////////////////////////////////////////////////////

export type KacherycloudRequest =
    GetClientInfoRequest |
    GetProjectBucketBaseUrlRequest |
    AccessGroupEncryptRequest |
    AccessGroupDecryptRequest |
    InitiateIpfsUploadRequest |
    FinalizeIpfsUploadRequest |
    FindIpfsFileRequest |
    InitiateFileUploadRequest |
    FinalizeFileUploadRequest |
    FindFileRequest |
    SetMutableRequest |
    GetMutableRequest |
    InitiateTaskResultUploadRequest |
    FinalizeTaskResultUploadRequest |
    SubscribeToPubsubChannelRequest |
    PublishToPubsubChannelRequest |
    CreateFeedRequest |
    GetFeedInfoRequest |
    AppendFeedMessagesRequest |
    GetFeedMessagesRequest

export const isKacherycloudRequest = (x: any): x is KacherycloudRequest => {
    return isOneOf([
        isGetClientInfoRequest,
        isGetProjectBucketBaseUrlRequest,
        isAccessGroupEncryptRequest,
        isAccessGroupDecryptRequest,
        isInitiateIpfsUploadRequest,
        isFinalizeIpfsUploadRequest,
        isFindIpfsFileRequest,
        isInitiateFileUploadRequest,
        isFinalizeFileUploadRequest,
        isFindFileRequest,
        isSetMutableRequest,
        isGetMutableRequest,
        isInitiateTaskResultUploadRequest,
        isFinalizeTaskResultUploadRequest,
        isSubscribeToPubsubChannelRequest,
        isPublishToPubsubChannelRequest,
        isCreateFeedRequest,
        isGetFeedInfoRequest,
        isAppendFeedMessagesRequest,
        isGetFeedMessagesRequest
    ])(x)
}

export type KacherycloudResponse =
    GetClientInfoResponse |
    GetProjectBucketBaseUrlResponse |
    AccessGroupEncryptResponse |
    AccessGroupDecryptResponse |
    InitiateIpfsUploadResponse |
    FinalizeIpfsUploadResponse |
    FindIpfsFileResponse |
    InitiateFileUploadResponse |
    FinalizeFileUploadResponse |
    FindFileResponse |
    SetMutableResponse |
    GetMutableResponse |
    InitiateTaskResultUploadResponse |
    FinalizeTaskResultUploadResponse |
    SubscribeToPubsubChannelResponse |
    PublishToPubsubChannelResponse |
    CreateFeedResponse |
    GetFeedInfoResponse |
    AppendFeedMessagesResponse |
    GetFeedMessagesResponse

export const isKacherycloudResponse = (x: any): x is KacherycloudResponse => {
    return isOneOf([
        isGetClientInfoResponse,
        isGetProjectBucketBaseUrlResponse,
        isAccessGroupEncryptResponse,
        isAccessGroupDecryptResponse,
        isInitiateIpfsUploadResponse,
        isFinalizeIpfsUploadResponse,
        isFindIpfsFileResponse,
        isInitiateFileUploadResponse,
        isFinalizeFileUploadResponse,
        isFindFileResponse,
        isSetMutableResponse,
        isGetMutableResponse,
        isInitiateTaskResultUploadResponse,
        isFinalizeTaskResultUploadResponse,
        isSubscribeToPubsubChannelResponse,
        isPublishToPubsubChannelResponse,
        isCreateFeedResponse,
        isGetFeedInfoResponse,
        isAppendFeedMessagesResponse,
        isGetFeedMessagesResponse
    ])(x)
}
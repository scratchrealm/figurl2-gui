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
// getProjectInfo

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
    bucketBaseUrl?: string
}

export const isGetProjectBucketBaseUrlResponse = (x: any): x is GetProjectBucketBaseUrlResponse => {
    return _validateObject(x, {
        type: isEqualTo('getProjectBucketBaseUrl'),
        found: isBoolean,
        bucketBaseURl: optional(isString)
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
// setMutable

export type SetMutableRequest = {
    payload: {
        type: 'setMutable'
        timestamp: number
        mutableKey: string
        cid: string
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
            cid: isString,
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
    cid?: string
    projectId?: string
}

export const isGetMutableResponse = (x: any): x is GetMutableResponse => {
    return _validateObject(x, {
        type: isEqualTo('getMutable'),
        found: isBoolean,
        cid: optional(isString),
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
            projectId: optional(isString)
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
        messages: JSONObject[]
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
            messages: isArrayOf(isJSONObject)
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
    InitiateIpfsUploadRequest |
    FinalizeIpfsUploadRequest |
    FindIpfsFileRequest |
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
        isInitiateIpfsUploadRequest,
        isFinalizeIpfsUploadRequest,
        isFindIpfsFileRequest,
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
    GetProjectBucketBaseUrlResponse |
    InitiateIpfsUploadResponse |
    FinalizeIpfsUploadResponse |
    FindIpfsFileResponse |
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
        isInitiateIpfsUploadResponse,
        isFinalizeIpfsUploadResponse,
        isFindIpfsFileResponse,
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
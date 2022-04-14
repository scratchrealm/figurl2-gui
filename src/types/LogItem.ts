import { isBoolean, isEqualTo, isNodeId, isNumber, isOneOf, isSha1Hash, isString, isUserId, NodeId, optional, Sha1Hash, UserId, _validateObject } from "../commonInterface/kacheryTypes";
import { isPubsubChannelName, PubsubChannelName } from "./PubsubMessage";

///////////////////////////////////////////////////////////////////////////

export type InitiateIpfsUploadLogItem = {
    type: 'initiateIpfsUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    size: number
    objectKey: string
    timestamp: number
}

export const isInitiateIpfsUploadLogItem = (x: any): x is InitiateIpfsUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('initiateIpfsUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        size: isNumber,
        objectKey: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type FinalizeIpfsUploadLogItem = {
    type: 'finalizeIpfsUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    size: number
    objectKey: string
    url: string
    alreadyExisted: boolean
    timestamp: number
}

export const isFinalizeIpfsUploadLogItem = (x: any): x is FinalizeIpfsUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('finalizeIpfsUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        size: isNumber,
        objectKey: isString,
        url: isString,
        alreadyExisted: isBoolean,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type FindIpfsFileLogItem = {
    type: 'findIpfsFile'
    found: boolean,
    cid: string,
    clientId?: NodeId
    projectId?: string
    userId?: UserId
    size?: number
    url?: string
    timestamp: number
}

export const isfindIpfsFileLogItem = (x: any): x is FindIpfsFileLogItem => (
    _validateObject(x, {
        type: isEqualTo('findIpfsFile'),
        found: isBoolean,
        cid: isString,
        clientId: optional(isNodeId),
        projectId: optional(isString),
        userId: optional(isUserId),
        size: optional(isNumber),
        url: optional(isString),
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type SetMutableLogItem = {
    type: 'setMutable'
    clientId: NodeId
    projectId: string
    userId: UserId
    mutableKey: string
    cid: string
    alreadyExisted: boolean
    timestamp: number
}

export const isSetMutableLogItem = (x: any): x is SetMutableLogItem => (
    _validateObject(x, {
        type: isEqualTo('setMutable'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        mutableKey: isString,
        cid: isString,
        alreadyExisted: isBoolean,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type GetMutableLogItem = {
    type: 'getMutable'
    found: boolean
    clientId?: NodeId
    projectId: string
    userId?: UserId
    mutableKey: string
    cid?: string
    timestamp: number
}

export const isGetMutableLogItem = (x: any): x is GetMutableLogItem => (
    _validateObject(x, {
        type: isEqualTo('getMutable'),
        found: isBoolean,
        clientId: optional(isNodeId),
        projectId: isString,
        userId: optional(isUserId),
        mutableKey: isString,
        cid: optional(isString),
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type InitiateTaskResultUploadLogItem = {
    type: 'initiateTaskResultUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    taskName: string
    taskJobId: Sha1Hash
    size: number
    objectKey: string
    timestamp: number
}

export const isInitiateTaskResultUploadLogItem = (x: any): x is InitiateTaskResultUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('initiateTaskResultUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        taskName: isString,
        taskJobId: isSha1Hash,
        size: isNumber,
        objectKey: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type FinalizeTaskResultUploadLogItem = {
    type: 'finalizeTaskResultUpload'
    clientId: NodeId
    projectId: string
    userId: UserId
    taskName: string
    taskJobId: Sha1Hash
    size: number
    objectKey: string
    alreadyExisted: boolean
    timestamp: number
}

export const isFinalizeTaskResultUploadLogItem = (x: any): x is FinalizeTaskResultUploadLogItem => (
    _validateObject(x, {
        type: isEqualTo('finalizeTaskResultUpload'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        taskName: isString,
        taskJobId: isSha1Hash,
        size: isNumber,
        objectKey: isString,
        alreadyExisted: isBoolean,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type SubscribeToPubsubChannelLogItem = {
    type: 'subscribeToPubsubChannel'
    clientId: NodeId
    projectId: string
    userId: UserId
    channelName: PubsubChannelName
    timestamp: number
}

export const isSubscribeToPubsubChannelLogItem = (x: any): x is SubscribeToPubsubChannelLogItem => (
    _validateObject(x, {
        type: isEqualTo('subscribeToPubsubChannel'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        channelName: isPubsubChannelName,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type PublishToPubsubChannelLogItem = {
    type: 'publishToPubsubChannel'
    clientId: NodeId
    projectId: string
    userId: UserId
    channelName: PubsubChannelName
    messageType: string
    timestamp: number
}

export const isPublishToPubsubChannelLogItem = (x: any): x is PublishToPubsubChannelLogItem => (
    _validateObject(x, {
        type: isEqualTo('publishToPubsubChannel'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        channelName: isPubsubChannelName,
        messageType: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type CreateFeedLogItem = {
    type: 'createFeed'
    clientId: NodeId
    projectId: string
    userId: UserId
    feedId: string
    timestamp: number
}

export const isCreateFeedLogItem = (x: any): x is CreateFeedLogItem => (
    _validateObject(x, {
        type: isEqualTo('createFeed'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        feedId: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type AppendFeedMessagesLogItem = {
    type: 'appendFeedMessages'
    clientId: NodeId
    projectId: string
    userId: UserId
    feedId: string
    numMessages: number
    size: number
    timestamp: number
}

export const isAppendFeedMessagesLogItem = (x: any): x is AppendFeedMessagesLogItem => (
    _validateObject(x, {
        type: isEqualTo('appendFeedMessages'),
        clientId: isNodeId,
        projectId: isString,
        userId: isUserId,
        feedId: isString,
        numMessages: isNumber,
        size: isNumber,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type GetFeedMessagesLogItem = {
    type: 'getFeedMessages'
    clientId?: NodeId
    projectId: string
    userId?: UserId
    feedId: string
    numMessages: number
    timestamp: number
}

export const isGetFeedMessagesLogItem = (x: any): x is GetFeedMessagesLogItem => (
    _validateObject(x, {
        type: isEqualTo('getFeedMessages'),
        clientId: optional(isNodeId),
        projectId: isString,
        userId: optional(isUserId),
        feedId: isString,
        numMessages: isNumber,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type GetFeedInfoLogItem = {
    type: 'getFeedInfo'
    clientId?: NodeId
    projectId: string
    userId?: UserId
    feedId: string
    timestamp: number
}

export const isGetFeedInfoLogItem = (x: any): x is GetFeedInfoLogItem => (
    _validateObject(x, {
        type: isEqualTo('getFeedInfo'),
        clientId: optional(isNodeId),
        projectId: isString,
        userId: optional(isUserId),
        feedId: isString,
        timestamp: isNumber
    })
)

///////////////////////////////////////////////////////////////////////////

export type LogItem =
    InitiateIpfsUploadLogItem
    | FinalizeIpfsUploadLogItem
    | FindIpfsFileLogItem
    | SetMutableLogItem
    | GetMutableLogItem
    | InitiateTaskResultUploadLogItem
    | FinalizeTaskResultUploadLogItem
    | SubscribeToPubsubChannelLogItem
    | PublishToPubsubChannelLogItem
    | CreateFeedLogItem
    | GetFeedInfoLogItem
    | AppendFeedMessagesLogItem
    | GetFeedMessagesLogItem

export const isLogItem = (x: any): x is LogItem => (
    isOneOf([
        isInitiateIpfsUploadLogItem,
        isFinalizeIpfsUploadLogItem,
        isfindIpfsFileLogItem,
        isSetMutableLogItem,
        isGetMutableLogItem,
        isInitiateTaskResultUploadLogItem,
        isFinalizeTaskResultUploadLogItem,
        isSubscribeToPubsubChannelLogItem,
        isPublishToPubsubChannelLogItem,
        isCreateFeedLogItem,
        isGetFeedInfoLogItem,
        isAppendFeedMessagesLogItem,
        isGetFeedMessagesLogItem
    ])(x)
)
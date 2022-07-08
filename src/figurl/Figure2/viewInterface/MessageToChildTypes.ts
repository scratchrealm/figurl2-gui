import { FigurlResponse, isFigurlResponse } from "./FigurlRequestTypes";
import { isFeedId, isJSONObject, isNumber, isUserId, JSONObject, UserId } from "./kacheryTypes";
import validateObject, { isArrayOf, isEqualTo, isOneOf, isString, optional } from "./validateObject";

export type TaskType = 'calculation' | 'action'

export const isTaskType = (x: any): x is TaskType => (['calculation', 'action'].includes(x))

export type TaskJobStatus = 'waiting' | 'started' | 'error' | 'finished'

export const isTaskJobStatus = (x: any): x is TaskJobStatus => (['waiting', 'started', 'error', 'finished'].includes(x))

/// figurl Response

export type FigurlResponseMessage = {
    type: 'figurlResponse',
    requestId: string,
    response: FigurlResponse
}

export const isFigurlResponseMessage = (x: any): x is FigurlResponseMessage => {
    return validateObject(x, {
        type: isEqualTo('figurlResponse'),
        requestId: isString,
        response: isFigurlResponse
    })
}

// newFeedMessages

export type NewFeedMessagesMessage = {
    type: 'newFeedMessages',
    feedId: string,
    position: number,
    messages: JSONObject[]
}

export const isNewFeedMessagesMessage = (x: any): x is NewFeedMessagesMessage => {
    return validateObject(x, {
        type: isEqualTo('newFeedMessages'),
        feedId: isFeedId,
        position: isNumber,
        messages: isArrayOf(isJSONObject)
    })
}

// taskStatusUpdate

export type TaskStatusUpdateMessage = {
    type: 'taskStatusUpdate',
    taskJobId: string,
    status: TaskJobStatus
    errorMessage?: string // for status=error
    returnValue?: any // for status=finished
}

export const isTaskStatusUpdateMessage = (x: any): x is TaskStatusUpdateMessage => {
    return validateObject(x, {
        type: isEqualTo('taskStatusUpdate'),
        taskJobId: isString,
        status: isTaskJobStatus,
        errorMessage: optional(isString),
        returnValue: optional(() => (true))
    })
}

// setCurrentUser

export type SetCurrentUserMessage = {
    type: 'setCurrentUser',
    userId?: UserId,
    googleIdToken?: string
}

export const isSetCurrentUserMessage = (x: any): x is SetCurrentUserMessage => {
    return validateObject(x, {
        type: isEqualTo('setCurrentUser'),
        userId: optional(isUserId),
        googleIdToken: optional(isString)
    })
}

// fileDownloadProgress

export type FileDownloadProgressMessage = {
    type: 'fileDownloadProgress'
    uri: string
    loaded: number
    total: number
}

export const isFileDownloadProgressMessage = (x: any): x is FileDownloadProgressMessage => {
    return validateObject(x, {
        type: isEqualTo('fileDownloadProgress'),
        uri: isString,
        loaded: isNumber,
        total: isNumber
    })
}

///////////////////////////////////////////////////////////////////////////////////

export type MessageToChild =
    FigurlResponseMessage |
    NewFeedMessagesMessage |
    TaskStatusUpdateMessage |
    SetCurrentUserMessage |
    FileDownloadProgressMessage

export const isMessageToChild = (x: any): x is MessageToChild => {
    return isOneOf([
        isFigurlResponseMessage,
        isNewFeedMessagesMessage,
        isTaskStatusUpdateMessage,
        isSetCurrentUserMessage,
        isFileDownloadProgressMessage
    ])(x)
}

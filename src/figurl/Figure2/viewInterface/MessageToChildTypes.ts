import { FigurlResponse, isFigurlResponse } from "./FigurlRequestTypes";
import { isUserId, UserId } from "./kacheryTypes";
import validateObject, { isEqualTo, isNumber, isOneOf, isString, optional } from "./validateObject";

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
    SetCurrentUserMessage |
    FileDownloadProgressMessage

export const isMessageToChild = (x: any): x is MessageToChild => {
    return isOneOf([
        isFigurlResponseMessage,
        isSetCurrentUserMessage,
        isFileDownloadProgressMessage
    ])(x)
}

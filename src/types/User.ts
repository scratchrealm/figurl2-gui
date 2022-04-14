import { isNumber, isString, isUserId, optional, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type UserSettings = {
    defaultProjectId?: string
}

export const isUserSettings = (y: any): y is UserSettings => (
    _validateObject(y, {
        defaultProjectId: optional(isString)
    })
)

export type User = {
    userId: UserId
    timestampCreated: number
    timestampLastModified: number
    settings: UserSettings
}

export const isUser = (x: any): x is User => {
    return _validateObject(x, {
        userId: isUserId,
        timestampCreated: isNumber,
        timestampLastModified: isNumber,
        settings: isUserSettings
    })
}
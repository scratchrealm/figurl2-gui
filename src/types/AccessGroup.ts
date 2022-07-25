import { isArrayOf, isBoolean, isNumber, isString, isUserId, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type AccessGroupUser = {
    userId: string
    read: boolean
    write: boolean
}

export const isAccessGroupUser = (x: any): x is AccessGroupUser => {
    return _validateObject(x, {
        userId: isString,
        read: isBoolean,
        write: isBoolean
    })
}

export type AccessGroup = {
    accessGroupId: string
    ownerId: UserId
    label: string
    timestampCreated: number
    timestampLastModified: number
    users: AccessGroupUser[]
    publicRead: boolean
    publicWrite: boolean
    keyHex: string
    ivHex: string
}

export const isAccessGroup = (x: any): x is AccessGroup => {
    return _validateObject(x, {
        accessGroupId: isString,
        ownerId: isUserId,
        label: isString,
        timestampCreated: isNumber,
        timestampLastModified: isNumber,
        users: isArrayOf(isAccessGroupUser),
        publicRead: isBoolean,
        publicWrite: isBoolean,
        keyHex: isString,
        ivHex: isString
    })
}
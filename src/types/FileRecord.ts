import { isNumber, isString, optional, _validateObject } from "../commonInterface/kacheryTypes"

export type FileRecord = {
    projectId: string
    hashAlg: string
    hash: string
    uri: string
    size: number
    url: string
    timestampCreated?: number // only optional for backward-compatibility
}

export const isFileRecord = (x: any): x is FileRecord => {
    return _validateObject(x, {
        projectId: isString,
        hashAlg: isString,
        hash: isString,
        uri: isString,
        size: isNumber,
        url: isString,
        timestampCreated: optional(isNumber)
    })
}
import { isNumber, isString, _validateObject } from "../commonInterface/kacheryTypes"

export type IpfsFile = {
    projectId: string
    cid: string
    size: number
    url: string
}

export const isIpfsFile = (x: any): x is IpfsFile => {
    return _validateObject(x, {
        projectId: isString,
        cid: isString,
        size: isNumber,
        url: isString
    })
}
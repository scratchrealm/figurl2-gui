import validateObject, { isNumber, isString } from "./viewInterface/validateObject"

export type Resource = {
    resourceName: string
    ownerId: string
    timestampCreated: number
    proxyUrl: string
}

export const isResource = (x: any): x is Resource => {
    return validateObject(x, {
        resourceName: isString,
        ownerId: isString,
        timestampCreated: isNumber,
        proxyUrl: isString
    })
}
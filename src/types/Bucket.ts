import { isNumber, isString, isUserId, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type BucketService = 'google' | 'filebase' | 'aws' | 'wasabi'

export const isBucketService = (s: any): s is BucketService => (['google', 'filebase', 'aws', 'wasabi'].includes(s))

export type Bucket = {
    bucketId: string
    ownerId: UserId
    label: string
    timestampCreated: number
    timestampLastModified: number
    service: BucketService
    uri: string
    credentials: string
}

export const isBucket = (x: any): x is Bucket => {
    return _validateObject(x, {
        bucketId: isString,
        ownerId: isUserId,
        label: isString,
        timestampCreated: isNumber,
        timestampLastModified: isNumber,
        service: isBucketService,
        uri: isString,
        credentials: isString
    })
}
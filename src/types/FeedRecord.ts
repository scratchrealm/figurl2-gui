import { isString, _validateObject } from "../commonInterface/kacheryTypes"

export type FeedRecord = {
    feedId: string
    projectId: string
}

export const isFeedRecord = (x: any): x is FeedRecord => (
    _validateObject(x, {
        feedId: isString,
        projectId: isString
    })
)
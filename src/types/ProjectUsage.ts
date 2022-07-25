import { isNumber, isString, optional, _validateObject } from "../commonInterface/kacheryTypes"

export type ProjectUsage = {
    projectId: string
    numLogItems?: number
    numInitiatedIpfsUploads?: number
    numFinalizedIpfsUploads?: number
    numIpfsBytesUploaded?: number
    numIpfsFileFinds?: number
    numIpfsFileFindBytes?: number
    numInitiatedFileUploads?: number
    numFinalizedFileUploads?: number
    numFileBytesUploaded?: number
    numFileFinds?: number
    numFileFindBytes?: number
    numSubscribeToFeedUpdates?: number
    numSubscribeToProvideTasks?: number
    numSubscribeToRequestTasks?: number
    numPublishToFeedUpdates?: number
    numPublishToProvideTasks?: number
    numPublishToRequestTasks?: number
    numInitiatedTaskResultUploads?: number
    numFinalizedTaskResultUploads?: number
    numTaskResultBytesUploaded?: number
    numFeedsCreated?: number
    numGetFeedInfo?: number
    numFeedMessagesRead?: number
    numFeedMessagesAppended?: number
    numFeedMessageBytesAppended?: number
    numGetMutable?: number
    numSetMutable?: number
}

export const isProjectUsage = (x: any): x is ProjectUsage => (
    _validateObject(x, {
        projectId: isString,
        numLogItems: optional(isNumber),
        numInitiatedIpfsUploads: optional(isNumber),
        numFinalizedIpfsUploads: optional(isNumber),
        numIpfsBytesUploaded: optional(isNumber),
        numIpfsFileFinds: optional(isNumber),
        numIpfsFileFindBytes: optional(isNumber),
        numInitiatedFileUploads: optional(isNumber),
        numFinalizedFileUploads: optional(isNumber),
        numFileBytesUploaded: optional(isNumber),
        numFileFinds: optional(isNumber),
        numFileFindBytes: optional(isNumber),
        numSubscribeToFeedUpdates: optional(isNumber),
        numSubscribeToProvideTasks: optional(isNumber),
        numSubscribeToRequestTasks: optional(isNumber),
        numPublishToFeedUpdates: optional(isNumber),
        numPublishToProvideTasks: optional(isNumber),
        numPublishToRequestTasks: optional(isNumber),
        numInitiatedTaskResultUploads: optional(isNumber),
        numFinalizedTaskResultUploads: optional(isNumber),
        numTaskResultBytesUploaded: optional(isNumber),
        numFeedsCreated: optional(isNumber),
        numGetFeedInfo: optional(isNumber),
        numFeedMessagesRead: optional(isNumber),
        numFeedMessagesAppended: optional(isNumber),
        numFeedMessageBytesAppended: optional(isNumber),
        numGetMutable: optional(isNumber),
        numSetMutable: optional(isNumber)
    })
)
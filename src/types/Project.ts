import { isNumber, isString, isUserId, UserId, optional, _validateObject } from "../commonInterface/kacheryTypes"

export type ProjectSettings = {
}

export const isProjectSettings = (x: any): x is ProjectSettings => (
    true
)

export type Project = {
    projectId: string
    ownerId: UserId
    label: string
    timestampCreated: number
    timestampLastModified: number
    settings: ProjectSettings
    bucketId?: string
}

export const isProject = (x: any): x is Project => {
    return _validateObject(x, {
        projectId: isString,
        ownerId: isUserId,
        label: isString,
        timestampCreated: isNumber,
        timestampLastModified: isNumber,
        settings: isProjectSettings,
        bucketId: optional(isString)
    })
}
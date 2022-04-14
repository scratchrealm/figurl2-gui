import { isNumber, isString, isUserId, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type ProjectSettings = {
}

export const isProjectSettings = (y: any): y is ProjectSettings => (
    true
)

export type Project = {
    projectId: string
    ownerId: UserId
    label: string
    timestampCreated: number
    timestampLastModified: number
    settings: ProjectSettings
}

export const isProject = (x: any): x is Project => {
    return _validateObject(x, {
        projectId: isString,
        ownerId: isUserId,
        label: isString,
        timestampCreated: isNumber,
        timestampLastModified: isNumber,
        settings: isProjectSettings
    })
}
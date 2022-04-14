import { isBoolean, isString, isUserId, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type ProjectMembershipPermissions = {
    read: boolean
    write: boolean
}

export const isProjectMembershipPermissions = (x: any) : x is ProjectMembershipPermissions => {
    return _validateObject(x, {
        read: isBoolean,
        write: isBoolean
    })
}

export type ProjectMembership = {
    projectId: string
    memberId: UserId
    permissions: ProjectMembershipPermissions
}

export const isProjectMembership = (x: any): x is ProjectMembership => {
    return _validateObject(x, {
        projectId: isString,
        memberId: isUserId,
        permissions: isProjectMembershipPermissions
    })
}
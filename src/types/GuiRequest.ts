import { isArrayOf, isBoolean, isEqualTo, isNodeId, isOneOf, isSignature, isString, isUserId, NodeId, optional, Signature, UserId, _validateObject } from "../commonInterface/kacheryTypes"
import { AccessGroup, AccessGroupUser, isAccessGroup, isAccessGroupUser } from "./AccessGroup"
import { Auth, isAuth } from "./Auth"
import { Bucket, BucketService, isBucket, isBucketService } from "./Bucket"
import { Client, isClient } from "./Client"
import { isProject, isProjectSettings, Project, ProjectSettings } from "./Project"
import { isProjectMembership, isProjectMembershipPermissions, ProjectMembership, ProjectMembershipPermissions } from "./ProjectMembership"
import { isProjectUsage, ProjectUsage } from "./ProjectUsage"
import { isUserSettings, UserSettings } from "./User"

//////////////////////////////////////////////////////////////////////////////////
// getProjectsForUser

export type GetProjectsForUserRequest = {
    type: 'getProjectsForUser'
    userId?: UserId
    auth: Auth
}

export const isGetProjectsForUserRequest = (x: any): x is GetProjectsForUserRequest => {
    return _validateObject(x, {
        type: isEqualTo('getProjectsForUser'),
        userId: optional(isUserId),
        auth: isAuth
    })
}

export type GetProjectsForUserResponse = {
    type: 'getProjectsForUser'
    projects: Project[]
}

export const isGetProjectsForUserResponse = (x: any): x is GetProjectsForUserResponse => {
    return _validateObject(x, {
        type: isEqualTo('getProjectsForUser'),
        projects: isArrayOf(isProject)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getProject

export type GetProjectRequest = {
    type: 'getProject'
    projectId: string
    auth: Auth
}

export const isGetProjectRequest = (x: any): x is GetProjectRequest => {
    return _validateObject(x, {
        type: isEqualTo('getProject'),
        projectId: isString,
        auth: isAuth
    })
}

export type GetProjectResponse = {
    type: 'getProject'
    project: Project
    projectUsage: ProjectUsage
    projectMemberships: ProjectMembership[]
}

export const isGetProjectResponse = (x: any): x is GetProjectResponse => {
    return _validateObject(x, {
        type: isEqualTo('getProject'),
        project: isProject,
        projectUsage: isProjectUsage,
        projectMemberships: isArrayOf(isProjectMembership)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// addProject

export type AddProjectRequest = {
    type: 'addProject'
    label: string
    ownerId: UserId
    auth: Auth
}

export const isAddProjectRequest = (x: any): x is AddProjectRequest => {
    return _validateObject(x, {
        type: isEqualTo('addProject'),
        label: isString,
        ownerId: isUserId,
        auth: isAuth
    })
}

export type AddProjectResponse = {
    type: 'addProject',
    projectId?: string // optional only for backward-compatibility
}

export const isAddProjectResponse = (x: any): x is AddProjectResponse => {
    return _validateObject(x, {
        type: isEqualTo('addProject'),
        projectId: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// deleteProject

export type DeleteProjectRequest = {
    type: 'deleteProject'
    projectId: string
    auth: Auth
}

export const isDeleteProjectRequest = (x: any): x is DeleteProjectRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteProject'),
        projectId: isString,
        auth: isAuth
    })
}

export type DeleteProjectResponse = {
    type: 'deleteProject'
}

export const isDeleteProjectResponse = (x: any): x is DeleteProjectResponse => {
    return _validateObject(x, {
        type: isEqualTo('deleteProject')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setProjectSettings

export type SetProjectSettingsRequest = {
    type: 'setProjectSettings'
    projectId: string
    projectSettings: ProjectSettings
    auth: Auth
}

export const isSetProjectSettingsRequest = (x: any): x is SetProjectSettingsRequest => {
    return _validateObject(x, {
        type: isEqualTo('setProjectSettings'),
        projectId: isString,
        projectSettings: isProjectSettings,
        auth: isAuth
    })
}

export type SetProjectSettingsResponse = {
    type: 'setProjectSettings'
}

export const isSetProjectSettingsResponse = (x: any): x is SetProjectSettingsResponse => {
    return _validateObject(x, {
        type: isEqualTo('setProjectSettings')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// addBucket

export type AddBucketRequest = {
    type: 'addBucket'
    label: string
    service: BucketService
    uri: string
    ownerId: UserId
    auth: Auth
}

export const isAddBucketRequest = (x: any): x is AddBucketRequest => {
    return _validateObject(x, {
        type: isEqualTo('addBucket'),
        label: isString,
        service: isBucketService,
        uri: isString,
        ownerId: isUserId,
        auth: isAuth
    })
}

export type AddBucketResponse = {
    type: 'addBucket'
    bucketId?: string // optional only for backward compatibility
}

export const isAddBucketResponse = (x: any): x is AddBucketResponse => {
    return _validateObject(x, {
        type: isEqualTo('addBucket'),
        bucketId: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// deleteBucket

export type DeleteBucketRequest = {
    type: 'deleteBucket'
    bucketId: string
    auth: Auth
}

export const isDeleteBucketRequest = (x: any): x is DeleteBucketRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteBucket'),
        bucketId: isString,
        auth: isAuth
    })
}

export type DeleteBucketResponse = {
    type: 'deleteBucket'
}

export const isDeleteBucketResponse = (x: any): x is DeleteBucketResponse => {
    return _validateObject(x, {
        type: isEqualTo('deleteBucket')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setBucketCredentials

export type SetBucketCredentialsRequest = {
    type: 'setBucketCredentials'
    bucketId: string
    bucketCredentials: string
    auth: Auth
}

export const isSetBucketCredentialsRequest = (x: any): x is SetBucketCredentialsRequest => {
    return _validateObject(x, {
        type: isEqualTo('setBucketCredentials'),
        bucketId: isString,
        bucketCredentials: isString,
        auth: isAuth
    })
}

export type SetBucketCredentialsResponse = {
    type: 'setBucketCredentials'
}

export const isSetBucketCredentialsResponse = (x: any): x is SetBucketCredentialsResponse => {
    return _validateObject(x, {
        type: isEqualTo('setBucketCredentials')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getBucketsForUser

export type GetBucketsForUserRequest = {
    type: 'getBucketsForUser'
    userId?: UserId
    auth: Auth
}

export const isGetBucketsForUserRequest = (x: any): x is GetBucketsForUserRequest => {
    return _validateObject(x, {
        type: isEqualTo('getBucketsForUser'),
        userId: optional(isUserId),
        auth: isAuth
    })
}

export type GetBucketsForUserResponse = {
    type: 'getBucketsForUser'
    buckets: Bucket[]
}

export const isGetBucketsForUserResponse = (x: any): x is GetBucketsForUserResponse => {
    return _validateObject(x, {
        type: isEqualTo('getBucketsForUser'),
        buckets: isArrayOf(isBucket)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getBucket

export type GetBucketRequest = {
    type: 'getBucket'
    bucketId: string
    auth: Auth
}

export const isGetBucketRequest = (x: any): x is GetBucketRequest => {
    return _validateObject(x, {
        type: isEqualTo('getBucket'),
        bucketId: isString,
        auth: isAuth
    })
}

export type GetBucketResponse = {
    type: 'getBucket'
    bucket: Bucket
}

export const isGetBucketResponse = (x: any): x is GetBucketResponse => {
    return _validateObject(x, {
        type: isEqualTo('getBucket'),
        bucket: isBucket
    })
}

//////////////////////////////////////////////////////////////////////////////////
// addAccessGroup

export type AddAccessGroupRequest = {
    type: 'addAccessGroup'
    label: string
    ownerId: UserId
    auth: Auth
}

export const isAddAccessGroupRequest = (x: any): x is AddAccessGroupRequest => {
    return _validateObject(x, {
        type: isEqualTo('addAccessGroup'),
        label: isString,
        ownerId: isUserId,
        auth: isAuth
    })
}

export type AddAccessGroupResponse = {
    type: 'addAccessGroup',
    accessGroupId: string
}

export const isAddAccessGroupResponse = (x: any): x is AddAccessGroupResponse => {
    return _validateObject(x, {
        type: isEqualTo('addAccessGroup'),
        accessGroupId: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// deleteAccessGroup

export type DeleteAccessGroupRequest = {
    type: 'deleteAccessGroup'
    accessGroupId: string
    auth: Auth
}

export const isDeleteAccessGroupRequest = (x: any): x is DeleteAccessGroupRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteAccessGroup'),
        accessGroupId: isString,
        auth: isAuth
    })
}

export type DeleteAccessGroupResponse = {
    type: 'deleteAccessGroup'
}

export const isDeleteAccessGroupResponse = (x: any): x is DeleteAccessGroupResponse => {
    return _validateObject(x, {
        type: isEqualTo('deleteAccessGroup')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setAccessGroupProperties

export type SetAccessGroupPropertiesRequest = {
    type: 'setAccessGroupProperties'
    accessGroupId: string
    label?: string
    publicRead?: boolean
    publicWrite?: boolean
    users?: AccessGroupUser[]
    auth: Auth
}

export const isSetAccessGroupPropertiesRequest = (x: any): x is SetAccessGroupPropertiesRequest => {
    return _validateObject(x, {
        type: isEqualTo('setAccessGroupProperties'),
        accessGroupId: isString,
        label: optional(isString),
        publicRead: optional(isBoolean),
        publicWrite: optional(isBoolean),
        users: optional(isArrayOf(isAccessGroupUser)),
        auth: isAuth
    })
}

export type SetAccessGroupPropertiesResponse = {
    type: 'setAccessGroupProperties'
}

export const isSetAccessGroupPropertiesResponse = (x: any): x is SetAccessGroupPropertiesResponse => {
    return _validateObject(x, {
        type: isEqualTo('setAccessGroupProperties')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getAccessGroupsForUser

export type GetAccessGroupsForUserRequest = {
    type: 'getAccessGroupsForUser'
    userId?: UserId
    auth: Auth
}

export const isGetAccessGroupsForUserRequest = (x: any): x is GetAccessGroupsForUserRequest => {
    return _validateObject(x, {
        type: isEqualTo('getAccessGroupsForUser'),
        userId: optional(isUserId),
        auth: isAuth
    })
}

export type GetAccessGroupsForUserResponse = {
    type: 'getAccessGroupsForUser'
    accessGroups: AccessGroup[]
}

export const isGetAccessGroupsForUserResponse = (x: any): x is GetAccessGroupsForUserResponse => {
    return _validateObject(x, {
        type: isEqualTo('getAccessGroupsForUser'),
        accessGroups: isArrayOf(isAccessGroup)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getAccessGroup

export type GetAccessGroupRequest = {
    type: 'getAccessGroup'
    accessGroupId: string
    auth: Auth
}

export const isGetAccessGroupRequest = (x: any): x is GetAccessGroupRequest => {
    return _validateObject(x, {
        type: isEqualTo('getAccessGroup'),
        accessGroupId: isString,
        auth: isAuth
    })
}

export type GetAccessGroupResponse = {
    type: 'getAccessGroup'
    accessGroup: AccessGroup
}

export const isGetAccessGroupResponse = (x: any): x is GetAccessGroupResponse => {
    return _validateObject(x, {
        type: isEqualTo('getAccessGroup'),
        accessGroup: isAccessGroup
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setUserSettings

export type SetUserSettingsRequest = {
    type: 'setUserSettings'
    userId: UserId
    userSettings: UserSettings
    auth: Auth
}

export const isSetUserSettingsRequest = (x: any): x is SetUserSettingsRequest => {
    return _validateObject(x, {
        type: isEqualTo('setUserSettings'),
        userId: isUserId,
        userSettings: isUserSettings,
        auth: isAuth
    })
}

export type SetUserSettingsResponse = {
    type: 'setUserSettings'
}

export const isSetUserSettingsResponse = (x: any): x is SetUserSettingsResponse => {
    return _validateObject(x, {
        type: isEqualTo('setUserSettings')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getUserSettings

export type GetUserSettingsRequest = {
    type: 'getUserSettings'
    userId: UserId
    auth: Auth
}

export const isGetUserSettingsRequest = (x: any): x is GetUserSettingsRequest => {
    return _validateObject(x, {
        type: isEqualTo('getUserSettings'),
        userId: isUserId,
        auth: isAuth
    })
}

export type GetUserSettingsResponse = {
    type: 'getUserSettings',
    userSettings: UserSettings
}

export const isGetUserSettingsResponse = (x: any): x is GetUserSettingsResponse => {
    return _validateObject(x, {
        type: isEqualTo('getUserSettings'),
        userSettings: isUserSettings
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getProjectMembershipsForUser

export type GetProjectMembershipsForUserRequest = {
    type: 'getProjectMembershipsForUser'
    userId?: UserId
    auth: Auth
}

export const isGetProjectMembershipsForUserRequest = (x: any): x is GetProjectMembershipsForUserRequest => {
    return _validateObject(x, {
        type: isEqualTo('getProjectMembershipsForUser'),
        userId: optional(isUserId),
        auth: isAuth
    })
}

export type GetProjectMembershipsForUserResponse = {
    type: 'getProjectMembershipsForUser'
    projectMemberships: ProjectMembership[]
}

export const isGetProjectMembershipsForUserResponse = (x: any): x is GetProjectMembershipsForUserResponse => {
    return _validateObject(x, {
        type: isEqualTo('getProjectMembershipsForUser'),
        projectMemberships: isArrayOf(isProjectMembership)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// addProjectMembership

export type AddProjectMembershipRequest = {
    type: 'addProjectMembership'
    projectId: string
    memberId: UserId
    auth: Auth
}

export const isAddProjectMembershipRequest = (x: any): x is AddProjectMembershipRequest => {
    return _validateObject(x, {
        type: isEqualTo('addProjectMembership'),
        projectId: isString,
        memberId: isUserId,
        auth: isAuth
    })
}

export type AddProjectMembershipResponse = {
    type: 'addProjectMembership'
}

export const isAddProjectMembershipResponse = (x: any): x is AddProjectMembershipResponse => {
    return _validateObject(x, {
        type: isEqualTo('addProjectMembership')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// deleteProjectMembership

export type DeleteProjectMembershipRequest = {
    type: 'deleteProjectMembership'
    projectId: string
    memberId: UserId
    auth: Auth
}

export const isDeleteProjectMembershipRequest = (x: any): x is DeleteProjectMembershipRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteProjectMembership'),
        projectId: isString,
        memberId: isUserId,
        auth: isAuth
    })
}

export type DeleteProjectMembershipResponse = {
    type: 'deleteProjectMembership'
}

export const isDeleteProjectMembershipResponse = (x: any): x is DeleteProjectMembershipResponse => {
    return _validateObject(x, {
        type: isEqualTo('deleteProjectMembership')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setProjectMembershipPermissions

export type SetProjectMembershipPermissionsRequest = {
    type: 'setProjectMembershipPermissions'
    projectId: string
    memberId: UserId
    projectMembershipPermissions: ProjectMembershipPermissions
    auth: Auth
}

export const isSetProjectMembershipPermissionsRequest = (x: any): x is SetProjectMembershipPermissionsRequest => {
    return _validateObject(x, {
        type: isEqualTo('setProjectMembershipPermissions'),
        projectId: isString,
        memberId: isUserId,
        projectMembershipPermissions: isProjectMembershipPermissions,
        auth: isAuth
    })
}

export type SetProjectMembershipPermissionsResponse = {
    type: 'setProjectMembershipPermissions'
}

export const isSetProjectMembershipPermissionsResponse = (x: any): x is SetProjectMembershipPermissionsResponse => {
    return _validateObject(x, {
        type: isEqualTo('setProjectMembershipPermissions')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// addClient

export type AddClientRequest = {
    type: 'addClient'
    clientId: NodeId
    label: string
    defaultProjectId?: string
    ownerId: UserId
    verificationDocument: {
        type: 'addClient'
    }
    verificationSignature: Signature
    auth: Auth
}

export const isAddClientRequest = (x: any): x is AddClientRequest => {
    return _validateObject(x, {
        type: isEqualTo('addClient'),
        clientId: isNodeId,
        label: isString,
        defaultProjectId: optional(isString),
        ownerId: isUserId,
        verificationDocument: (a: any) => (
            _validateObject(a, {
                type: isEqualTo('addClient')
            })
        ),
        verificationSignature: isSignature,
        auth: isAuth
    })
}

export type AddClientResponse = {
    type: 'addClient'
}

export const isAddClientResponse = (x: any): x is AddClientResponse => {
    return _validateObject(x, {
        type: isEqualTo('addClient')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// deleteClient

export type DeleteClientRequest = {
    type: 'deleteClient'
    clientId: NodeId
    ownerId: UserId
    auth: Auth
}

export const isDeleteClientRequest = (x: any): x is DeleteClientRequest => {
    return _validateObject(x, {
        type: isEqualTo('deleteClient'),
        clientId: isNodeId,
        ownerId: isUserId,
        auth: isAuth
    })
}

export type DeleteClientResponse = {
    type: 'deleteClient'
}

export const isDeleteClientResponse = (x: any): x is DeleteClientResponse => {
    return _validateObject(x, {
        type: isEqualTo('deleteClient')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getClients

export type GetClientsRequest = {
    type: 'getClients'
    userId?: UserId
    auth: Auth
}

export const isGetClientsRequest = (x: any): x is GetClientsRequest => {
    return _validateObject(x, {
        type: isEqualTo('getClients'),
        userId: optional(isUserId),
        auth: isAuth
    })
}

export type GetClientsResponse = {
    type: 'getClients'
    clients: Client[]
}

export const isGetClientsResponse = (x: any): x is GetClientsResponse => {
    return _validateObject(x, {
        type: isEqualTo('getClients'),
        clients: isArrayOf(isClient)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setClientInfo

export type SetClientInfoRequest = {
    type: 'setClientInfo'
    clientId: NodeId
    label?: string
    defaultProjectId?: string
    auth: Auth
}

export const isSetClientInfoRequest = (x: any): x is SetClientInfoRequest => {
    return _validateObject(x, {
        type: isEqualTo('setClientInfo'),
        clientId: isNodeId,
        label: optional(isString),
        defaultProjectId: optional(isString),
        auth: isAuth
    })
}

export type SetClientInfoResponse = {
    type: 'setClientInfo'
}

export const isSetClientInfoResponse = (x: any): x is SetClientInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('setClientInfo')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setProjectInfo

export type SetProjectInfoRequest = {
    type: 'setProjectInfo'
    projectId: string
    label?: string
    bucketId?: string
    auth: Auth
}

export const isSetProjectInfoRequest = (x: any): x is SetProjectInfoRequest => {
    return _validateObject(x, {
        type: isEqualTo('setProjectInfo'),
        projectId: isString,
        label: optional(isString),
        bucketId: optional(isString),
        defaultProjectId: optional(isString),
        auth: isAuth
    })
}

export type SetProjectInfoResponse = {
    type: 'setProjectInfo'
}

export const isSetProjectInfoResponse = (x: any): x is SetProjectInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('setProjectInfo')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getProjectUsage

export type GetProjectUsageRequest = {
    type: 'getProjectUsage'
    projectId: string
    auth: Auth
}

export const isGetProjectUsageRequest = (x: any): x is GetProjectUsageRequest => {
    return _validateObject(x, {
        type: isEqualTo('getProjectUsage'),
        projectId: isString,
        auth: isAuth
    })
}

export type GetProjectUsageResponse = {
    type: 'getProjectUsage'
    projectUsage: ProjectUsage
}

export const isGetProjectUsageResponse = (x: any): x is GetProjectUsageResponse => {
    return _validateObject(x, {
        type: isEqualTo('getProjectUsage'),
        projectUsage: isProjectUsage
    })
}

//////////////////////////////////////////////////////////////////////////////////
// adminGetProjects

export type AdminGetProjectsRequest = {
    type: 'adminGetProjects'
    auth: Auth
}

export const isAdminGetProjectsRequest = (x: any): x is AdminGetProjectsRequest => {
    return _validateObject(x, {
        type: isEqualTo('adminGetProjects'),
        auth: isAuth
    })
}

export type AdminGetProjectsResponse = {
    type: 'adminGetProjects'
    projects: Project[]
    projectUsages?: ProjectUsage[]
}

export const isAdminGetProjectsResponse = (x: any): x is AdminGetProjectsResponse => {
    return _validateObject(x, {
        type: isEqualTo('adminGetProjects'),
        projects: isArrayOf(isProject),
        projectUsages: optional(isArrayOf(isProjectUsage))
    })
}

//////////////////////////////////////////////////////////////////////////////////
// setBucketLabel

export type SetBucketLabelRequest = {
    type: 'setBucketLabel'
    bucketId: string
    label: string
    auth: Auth
}

export const isSetBucketLabelRequest = (x: any): x is SetBucketLabelRequest => {
    return _validateObject(x, {
        type: isEqualTo('setBucketLabel'),
        bucketId: isString,
        label: isString,
        auth: isAuth
    })
}

export type SetBucketLabelResponse = {
    type: 'setBucketLabel'
}

export const isSetBucketLabelResponse = (x: any): x is SetBucketLabelResponse => {
    return _validateObject(x, {
        type: isEqualTo('setBucketLabel')
    })
}

//////////////////////////////////////////////////////////////////////////////////
// manualDeleteFileRecord

export type ManualDeleteFileRecordRequest = {
    type: 'manualDeleteFileRecord'
    projectId: string
    hashAlg: string
    hash: string
    auth: Auth
}

export const isManualDeleteFileRecordRequest = (x: any): x is ManualDeleteFileRecordRequest => {
    return _validateObject(x, {
        type: isEqualTo('manualDeleteFileRecord'),
        projectId: isString,
        hashAlg: isString,
        hash: isString,
        auth: isAuth
    })
}

export type ManualDeleteFileRecordResponse = {
    type: 'manualDeleteFileRecord'
}

export const isManualDeleteFileRecordResponse = (x: any): x is ManualDeleteFileRecordResponse => {
    return _validateObject(x, {
        type: isEqualTo('manualDeleteFileRecord')
    })
}

//////////////////////////////////////////////////////////////////////////////////

export type GuiRequest =
    GetProjectsForUserRequest |
    GetProjectRequest |
    AddProjectRequest |
    DeleteProjectRequest |
    SetProjectSettingsRequest |
    GetProjectMembershipsForUserRequest |
    AddProjectMembershipRequest |
    DeleteProjectMembershipRequest |
    SetProjectMembershipPermissionsRequest |
    AddBucketRequest |
    DeleteBucketRequest |
    SetBucketCredentialsRequest |
    GetBucketsForUserRequest |
    GetBucketRequest |
    AddAccessGroupRequest |
    DeleteAccessGroupRequest |
    SetAccessGroupPropertiesRequest |
    GetAccessGroupsForUserRequest |
    GetAccessGroupRequest |
    AddClientRequest |
    DeleteClientRequest |
    GetClientsRequest |
    GetUserSettingsRequest |
    SetUserSettingsRequest |
    SetClientInfoRequest |
    SetProjectInfoRequest |
    SetBucketLabelRequest |
    GetProjectUsageRequest |
    AdminGetProjectsRequest |
    ManualDeleteFileRecordRequest

export const isGuiRequest = (x: any): x is GuiRequest => {
    return isOneOf([
        isGetProjectsForUserRequest,
        isGetProjectRequest,
        isAddProjectRequest,
        isDeleteProjectRequest,
        isSetProjectSettingsRequest,
        isGetProjectMembershipsForUserRequest,
        isAddProjectMembershipRequest,
        isDeleteProjectMembershipRequest,
        isSetProjectMembershipPermissionsRequest,
        isAddBucketRequest,
        isDeleteBucketRequest,
        isSetBucketCredentialsRequest,
        isGetBucketsForUserRequest,
        isGetBucketRequest,
        isAddAccessGroupRequest,
        isDeleteAccessGroupRequest,
        isSetAccessGroupPropertiesRequest,
        isGetAccessGroupsForUserRequest,
        isGetAccessGroupRequest,
        isAddClientRequest,
        isDeleteClientRequest,
        isGetClientsRequest,
        isGetUserSettingsRequest,
        isSetUserSettingsRequest,
        isSetClientInfoRequest,
        isSetProjectInfoRequest,
        isSetBucketLabelRequest,
        isGetProjectUsageRequest,
        isAdminGetProjectsRequest,
        isManualDeleteFileRecordRequest
    ])(x)
}

export type GuiResponse =
    GetProjectsForUserResponse |
    GetProjectResponse |
    AddProjectResponse |
    DeleteProjectResponse |
    SetProjectSettingsResponse |
    GetProjectMembershipsForUserResponse |
    AddProjectMembershipResponse |
    DeleteProjectMembershipResponse |
    SetProjectMembershipPermissionsResponse |
    AddBucketResponse |
    DeleteBucketResponse |
    SetBucketCredentialsResponse |
    GetBucketsForUserResponse |
    GetBucketResponse |
    AddAccessGroupResponse |
    DeleteAccessGroupResponse |
    SetAccessGroupPropertiesResponse |
    GetAccessGroupsForUserResponse |
    GetAccessGroupResponse |
    AddClientResponse |
    DeleteClientResponse |
    GetClientsResponse |
    GetUserSettingsResponse |
    SetUserSettingsResponse |
    SetClientInfoResponse |
    SetProjectInfoResponse |
    SetBucketLabelResponse |
    GetProjectUsageResponse |
    AdminGetProjectsResponse |
    ManualDeleteFileRecordResponse

export const isGuiResponse = (x: any): x is GuiResponse => {
    return isOneOf([
        isGetProjectsForUserResponse,
        isGetProjectResponse,
        isAddProjectResponse,
        isDeleteProjectResponse,
        isSetProjectSettingsResponse,
        isGetProjectMembershipsForUserResponse,
        isAddProjectMembershipResponse,
        isDeleteProjectMembershipResponse,
        isSetProjectMembershipPermissionsResponse,
        isAddBucketResponse,
        isDeleteBucketResponse,
        isSetBucketCredentialsResponse,
        isGetBucketsForUserResponse,
        isGetBucketResponse,
        isAddAccessGroupResponse,
        isDeleteAccessGroupResponse,
        isSetAccessGroupPropertiesResponse,
        isGetAccessGroupsForUserResponse,
        isGetAccessGroupResponse,
        isAddClientResponse,
        isDeleteClientResponse,
        isGetClientsResponse,
        isGetUserSettingsResponse,
        isSetUserSettingsResponse,
        isSetClientInfoResponse,
        isSetProjectInfoResponse,
        isSetBucketLabelResponse,
        isGetProjectUsageResponse,
        isAdminGetProjectsResponse,
        isManualDeleteFileRecordResponse
    ])(x)
}
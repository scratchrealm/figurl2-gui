import { isNodeId, isNumber, isString, isUserId, NodeId, optional, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type Client = {
    clientId: NodeId
    ownerId: UserId
    timestampCreated: number
    label: string
    defaultProjectId?: string
}

export const isClient = (x: any): x is Client => {
    return _validateObject(x, {
        clientId: isNodeId,
        ownerId: isUserId,
        timestampCreated: isNumber,
        label: isString,
        defaultProjectId: optional(isString)
    })
}
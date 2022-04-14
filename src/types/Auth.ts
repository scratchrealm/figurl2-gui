import { isString, isUserId, optional, UserId, _validateObject } from "../commonInterface/kacheryTypes"

export type Auth = {
    userId?: UserId,
    googleIdToken?: string
    reCaptchaToken?: string
}

export const isAuth = (x: any): x is Auth => {
    return _validateObject(x, {
        userId: optional(isUserId),
        googleIdToken: optional(isString),
        reCaptchaToken: optional(isString)
    })
}
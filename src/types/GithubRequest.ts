import { isBoolean, isEqualTo, isOneOf, isString, optional, _validateObject } from "../commonInterface/kacheryTypes"

//////////////////////////////////////////////////////////////////////////////////
// loadGistFile

export type LoadGistFileRequest = {
    type: 'loadGistFile'
    userName: string
    gistId: string
    fileName: string
}

export const isLoadGistFileRequest = (x: any): x is LoadGistFileRequest => {
    return _validateObject(x, {
        type: isEqualTo('loadGistFile'),
        userName: isString,
        gistId: isString,
        fileName: isString
    })
}

export type LoadGistFileResponse = {
    type: 'loadGistFile'
    content: string
}

export const isLoadGistFileResponse = (x: any): x is LoadGistFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('loadGistFile'),
        content: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// loadGithubFile

export type LoadGithubFileRequest = {
    type: 'loadGithubFile'
    userName: string
    repoName: string
    branchName: string
    fileName: string
}

export const isLoadGithubFileRequest = (x: any): x is LoadGithubFileRequest => {
    return _validateObject(x, {
        type: isEqualTo('loadGithubFile'),
        userName: isString,
        repoName: isString,
        branchName: isString,
        fileName: isString
    })
}

export type LoadGithubFileResponse = {
    type: 'loadGithubFile'
    content: string
}

export const isLoadGithubFileResponse = (x: any): x is LoadGithubFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('loadGithubFile'),
        content: isString
    })
}

//////////////////////////////////////////////////////////////////////////////////
// storeGithubFile

export type StoreGithubFileRequest = {
    type: 'storeGithubFile'
    userName: string
    repoName: string
    branchName: string
    fileName: string
    content: string
    githubToken: string
}

export const isStoreGithubFileRequest = (x: any): x is StoreGithubFileRequest => {
    return _validateObject(x, {
        type: isEqualTo('storeGithubFile'),
        userName: isString,
        repoName: isString,
        branchName: isString,
        fileName: isString,
        content: isString,
        githubToken: isString
    })
}

export type StoreGithubFileResponse = {
    type: 'storeGithubFile'
    success: boolean
    error?: string
}

export const isStoreGithubFileResponse = (x: any): x is StoreGithubFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('storeGithubFile'),
        success: isBoolean,
        error: optional(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////

export type GithubRequest =
    LoadGistFileRequest |
    LoadGithubFileRequest |
    StoreGithubFileRequest

export const isGithubRequest = (x: any): x is GithubRequest => {
    return isOneOf([
        isLoadGistFileRequest,
        isLoadGithubFileRequest,
        isStoreGithubFileRequest
    ])(x)
}

export type GithubResponse =
    LoadGistFileResponse |
    LoadGithubFileResponse |
    StoreGithubFileResponse

export const isGithubResponse = (x: any): x is GithubResponse => {
    return isOneOf([
        isLoadGistFileResponse,
        isLoadGithubFileResponse,
        isStoreGithubFileResponse
    ])(x)
}
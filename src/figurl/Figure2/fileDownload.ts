import axios from 'axios';
import { Buffer } from 'buffer';
import { signMessage } from 'commonInterface/crypto/signatures';
import { isBoolean, isEqualTo, isNodeId, isNumber, isSignature, isString, NodeId, optional, Signature, _validateObject } from 'commonInterface/kacheryTypes';
import * as crypto from 'crypto';
import { localKacheryServerBaseUrl, localKacheryServerIsAvailable, localKacheryServerIsEnabled } from 'figurl/MainWindow/ApplicationBar/LocalKacheryDialog';
import { FindFileRequest, isFindFileResponse } from './GatewayRequest';
import { getKacheryCloudClientInfo } from './getKacheryCloudClientInfo';
import loadLocalSha1TextFile from './loadLocalSha1TextFile';

export type FindIpfsFileRequest = {
    payload: {
        type: 'findIpfsFile'
        timestamp: number
        cid: string
        projectId?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isFindIpfsFileRequest = (x: any): x is FindIpfsFileRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('findIpfsFile'),
            timestamp: isNumber,
            cid: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type FindIpfsFileResponse = {
    type: 'findIpfsFile'
    found: boolean
    projectId?: string
    size?: number
    url?: string
}

export const isFindIpfsFileResponse = (x: any): x is FindIpfsFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('findIpfsFile'),
        found: isBoolean,
        projectId: optional(isString),
        size: optional(isNumber),
        url: optional(isString)
    })
}

// export type FindFileRequest = {
//     payload: {
//         type: 'findFile'
//         timestamp: number
//         hashAlg: string
//         hash: string
//         projectId?: string
//     }
//     fromClientId?: NodeId
//     signature?: Signature
// }

// export const isFindFileRequest = (x: any): x is FindFileRequest => {
//     const isPayload = (y: any) => {
//         return _validateObject(y, {
//             type: isEqualTo('findFile'),
//             timestamp: isNumber,
//             hashAlg: isString,
//             hash: isString,
//             projectId: optional(isString)
//         })
//     }
//     return _validateObject(x, {
//         payload: isPayload,
//         fromClientId: optional(isNodeId),
//         signature: optional(isSignature)
//     })
// }

// export type FindFileResponse = {
//     type: 'findFile'
//     found: boolean
//     projectId?: string
//     size?: number
//     url?: string
//     timestampCreated?: number
//     timestampAccessed?: number
// }

// export const isFindFileResponse = (x: any): x is FindFileResponse => {
//     return _validateObject(x, {
//         type: isEqualTo('findFile'),
//         found: isBoolean,
//         projectId: optional(isString),
//         size: optional(isNumber),
//         url: optional(isString),
//         timestampCreated: optional(isNumber),
//         timestampAccessed: optional(isNumber)
//     })
// }

const ipfsDownload = async (cid: string) => {
    const downloadUrl = await ipfsDownloadUrl(cid)
    const y = await axios.get(downloadUrl, {responseType: 'json'})
    return y.data
}

(window as any).process = (window as any).process || {nextTick: () => {}}

export const fileDownload = async (hashAlg: string, hash: string, kacheryGatewayUrl: string, onProgress: (a: {loaded: number, total: number}) => void, githubAuth: {userId?: string, accessToken?: string}, zone: string, o: {localMode: boolean, parseJson: boolean}) => {
    const {localMode} = o
    console.info(`${localMode ? "Local" : "Cloud"}: ${hashAlg}/${hash}`)
    if (!localMode) {
        const {url: downloadUrl, size, foundLocally} = await fileDownloadUrl(hashAlg, hash, kacheryGatewayUrl, githubAuth, zone) || {}
        if (!downloadUrl) {
            throw Error(`Unable to find file in kachery cloud: ${hashAlg}://${hash}`)
        }
        if ((size) && (onProgress)) {
            onProgress({loaded: 0, total: size})
        }
        let timestampProgress = Date.now()
        let firstProgress = true

        const rrr = await fetch(downloadUrl)
        if (!rrr.body) throw Error('No body in response.')

        const reader = rrr.body.getReader()
        const total = parseInt(rrr.headers.get('Content-Length') || '0')

        const shasum = crypto.createHash('sha1')
        const chunks: Uint8Array[] = []
        let numBytesDownloaded = 0
        while(true) {
            const {done, value: chunk} = await reader.read()
            if (done) {
                break
            }
            numBytesDownloaded += chunk.byteLength
            shasum.update(chunk)
            chunks.push(chunk)
            if (onProgress) {
                const loaded = numBytesDownloaded
                const elapsedSec = (Date.now() - timestampProgress) / 1000
                if ((elapsedSec >= 0.5) || (firstProgress)) {
                    onProgress({loaded, total})
                    timestampProgress = Date.now()
                    firstProgress = false
                }
            }
        }
        const computedSha1 = shasum.digest('hex')
        if (hashAlg === 'sha1') {
            if (computedSha1 !== hash) {
                throw Error(`Invalid sha1 of downloaded file: ${computedSha1} <> ${hash}`)
            }
        }
        const data = Buffer.concat(chunks)
        const doStoreLocally = ((localKacheryServerIsEnabled()) && (!foundLocally) && (await localKacheryServerIsAvailable({retry: false})) && (hashAlg === 'sha1'))
        if (doStoreLocally) {
            // note: I tried doing this via streaming, but had a terrible time getting it to work by posting chunks. Tried both axios and fetch.
            console.info(`STORING CONTENT LOCALLY: ${hashAlg}/${hash}`)
            await fetch(`${localKacheryServerBaseUrl}/upload/${hashAlg}/${hash}`, {
                body: data,
                method: 'POST'
            })
        }
        const txt = new TextDecoder().decode(data)
        if (o.parseJson) {
            let ret: string
            try {
                ret = JSON.parse(txt)
            }
            catch {
                console.warn(txt)
                throw Error('Problem parsing JSON')
            }
            return ret
        }
        else return txt

        // had problem with http and CORS - switching to fetch
        // had trouble with axios and streams (doesn't want to return a stream even when returnType='stream')
    }
    else {
        if (hashAlg !== 'sha1') throw Error(`Invalid hashAlg ${hashAlg} for local file`)
        const txt = await loadLocalSha1TextFile(hash)
        if (!txt) throw Error(`Unable to find file locally: ${hashAlg}://${hash}`)
        const ret = JSON.parse(txt)
        return ret
    }
}

export const ipfsDownloadUrl = async (cid: string): Promise<string> => {
    const url = 'https://cloud.kacheryhub.org/api/kacherycloud'
    // const url = 'http://localhost:3001/api/kacherycloud'
    const req: FindIpfsFileRequest = {
        payload: {
            type: 'findIpfsFile',
            timestamp: Date.now(),
            cid
        }
    }
    const x = await axios.post(url, req)
    const resp = x.data
    if (!isFindIpfsFileResponse(resp)) {
        console.warn(resp)
        throw Error('Unexpected findIpfsFile response')
    }
    let downloadUrl: string
    if ((resp.found) && (resp.url)) {
        downloadUrl = resp.url
    }
    else {
        downloadUrl = `https://cloudflare-ipfs.com/ipfs/${cid}`
    }
    return downloadUrl
}

const getFileDownloadUrlForLocalKacheryServer = async (hashAlg: string, hash: string): Promise<{url: string, size: number} | undefined> => {
    if (!(await localKacheryServerIsAvailable({retry: false}))) {
        return undefined
    }
    if (hashAlg !== 'sha1') {
        return undefined
    }
    const url = `${localKacheryServerBaseUrl}/sha1/${hash}`
    let resp
    try {
        resp = await axios.head(url)
    }
    catch(err) {
        return undefined
    }
    if (resp.status === 200) {
        const size = parseInt(resp.headers['content-length'])
        console.info(`Found locally: ${hashAlg}/${hash}`)
        return {url, size}
    }
    else {
        return undefined
    }
}

export const fileDownloadUrl = async (hashAlg: string, hash: string, kacheryGatewayUrl: string, githubAuth: {userId?: string, accessToken?: string}, zone: string): Promise<{url: string, size?: number, foundLocally: boolean} | undefined> => {
    if ((localKacheryServerIsEnabled()) && (await localKacheryServerIsAvailable({retry: false}))) {
        const rrr = await getFileDownloadUrlForLocalKacheryServer(hashAlg, hash)
        if (rrr) {
            return {
                url: rrr.url,
                size: rrr.size,
                foundLocally: true
            }
        }
    }

    const {clientId, keyPair} = await getKacheryCloudClientInfo()
    const url = `${kacheryGatewayUrl}/api/gateway`
    // const url = 'http://localhost:3001/api/kacherycloud'
    const payload = {
        type: 'findFile' as 'findFile',
        timestamp: Date.now(),
        hashAlg: hashAlg as 'sha1',
        hash,
        zone
    }
    const signature = await signMessage(payload, keyPair)
    const req: FindFileRequest = {
        payload,
        fromClientId: !githubAuth.userId ? clientId : undefined,
        signature: !githubAuth.userId ? signature : undefined,
        githubUserId: githubAuth.userId,
        githubAccessToken: githubAuth.accessToken
    }
    const x = await axios.post(url, req)
    const resp = x.data
    if (!isFindFileResponse(resp)) {
        console.warn(resp)
        throw Error('Unexpected findFile response')
    }
    if ((resp.found) && (resp.url)) {
        return {
            url: resp.url,
            size: resp.size,
            foundLocally: false
        }
    }
    else {
        return undefined
    }
}


export default ipfsDownload
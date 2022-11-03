import axios from 'axios';
import { signMessage } from 'commonInterface/crypto/signatures';
import { isBoolean, isEqualTo, isNodeId, isNumber, isSignature, isString, NodeId, optional, Signature, _validateObject } from 'commonInterface/kacheryTypes';
import * as crypto from 'crypto';
import * as http from 'http';
import { getKacheryCloudClientInfo } from './getKacheryCloudClientInfo';
import loadLocalSha1TextFile from './loadLocalSha1TextFile';
import validateObject, { isOneOf } from './viewInterface/validateObject';

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

export type FindFileRequest = {
    payload: {
        type: 'findFile'
        timestamp: number
        hashAlg: 'sha1'
        hash: string
    }
    fromClientId: NodeId
    signature: Signature
}

export const isFindFileRequest = (x: any): x is FindFileRequest => {
    const isPayload = (y: any) => {
        return validateObject(y, {
            type: isEqualTo('findFile'),
            timestamp: isNumber,
            hashAlg: isOneOf([isEqualTo('sha1')]),
            hash: isString
        })
    }
    return validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type FindFileResponse = {
    type: 'findFile'
    found: boolean
    size?: number
    url?: string
    bucketUri?: string
    objectKey?: string
    cacheHit?: boolean
}

export const isFindFileResponse = (x: any): x is FindFileResponse => {
    return validateObject(x, {
        type: isEqualTo('findFile'),
        found: isBoolean,
        size: optional(isNumber),
        url: optional(isString),
        bucketUri: optional(isString),
        objectKey: optional(isString),
        cacheHit: optional(isBoolean)
    })
}

const ipfsDownload = async (cid: string) => {
    const downloadUrl = await ipfsDownloadUrl(cid)
    const y = await axios.get(downloadUrl, {responseType: 'json'})
    return y.data
}

export const fileDownload = async (hashAlg: string, hash: string, kacheryGatewayUrl: string, onProgress: (a: {loaded: number, total: number}) => void, o: {localMode: boolean}) => {
    const {localMode} = o
    console.info(`${localMode ? "Local" : "Cloud"}: ${hashAlg}/${hash}`)
    if (!localMode) {
        const {url: downloadUrl, size} = await fileDownloadUrl(hashAlg, hash, kacheryGatewayUrl) || {}
        if (!downloadUrl) {
            throw Error(`Unable to find file in kachery cloud: ${hashAlg}://${hash}`)
        }
        if ((size) && (onProgress)) {
            onProgress({loaded: 0, total: size})
        }
        let timestampProgress = Date.now()
        let firstProgress = true

        // having trouble with axios and streams (doesn't want to return a stream even when returnType='stream')
        return new Promise((resolve, reject) => {
            http.get(downloadUrl, response => {
                const chunks: Uint8Array[] = []
                const shasum = crypto.createHash('sha1')
                let numBytesDownloaded = 0
                
                response.on('data', (chunk: Uint8Array) => {
                    numBytesDownloaded += chunk.byteLength
                    shasum.update(chunk)
                    chunks.push(chunk)
                    if (onProgress) {
                        const loaded = numBytesDownloaded
                        const total = parseInt(response.headers['content-length'] || '0')
                        const elapsedSec = (Date.now() - timestampProgress) / 1000
                        if ((elapsedSec >= 0.5) || (firstProgress)) {
                            onProgress({loaded, total})
                            timestampProgress = Date.now()
                            firstProgress = false
                        }
                    }
                })
                response.on('end', () => {
                    const computedSha1 = shasum.digest('hex')
                    if (hashAlg === 'sha1') {
                        if (computedSha1 !== hash) {
                            reject(`Invalid sha1 of downloaded file: ${computedSha1} <> ${hash}`)
                            return
                        }
                    }
                    const data = Buffer.concat(chunks)
                    const txt = new TextDecoder().decode(data)
                    let ret: string
                    try {
                        ret = JSON.parse(txt)
                    }
                    catch {
                        console.warn(txt)
                        reject('Problem parsing JSON')
                        return
                    }
                    resolve(ret)
                })
                response.on('error', err => {
                    reject(err)
                })
            })
        })

        // see comment above about axios
        // const y = await axios.get(downloadUrl, {
        //     responseType: 'json',
        //     onDownloadProgress: (event) => {
        //         if (onProgress) {
        //             const loaded: number = event.loaded
        //             const total: number = event.total
        //             const elapsedSec = (Date.now() - timestampProgress) / 1000
        //             if ((elapsedSec >= 0.5) || (firstProgress)) {
        //                 onProgress({loaded, total})
        //                 timestampProgress = Date.now()
        //                 firstProgress = false
        //             }
        //         }
        //     }
        // })
        // return y.data
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

export const fileDownloadUrl = async (hashAlg: string, hash: string, kacheryGatewayUrl: string): Promise<{url: string, size?: number} | undefined> => {
    const {clientId, keyPair} = await getKacheryCloudClientInfo()
    const url = `${kacheryGatewayUrl}/api/gateway`
    // const url = 'http://localhost:3001/api/kacherycloud'
    const payload = {
        type: 'findFile' as 'findFile',
        timestamp: Date.now(),
        hashAlg: hashAlg as 'sha1',
        hash
    }
    const signature = await signMessage(payload, keyPair)
    const req: FindFileRequest = {
        payload,
        fromClientId: clientId,
        signature
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
            size: resp.size
        }
    }
    else {
        return undefined
    }
}


export default ipfsDownload
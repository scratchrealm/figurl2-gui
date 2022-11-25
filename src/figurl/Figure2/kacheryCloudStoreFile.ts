import axios from 'axios';
import { signMessage } from 'commonInterface/crypto/signatures';
import { sha1OfString } from 'commonInterface/kacheryTypes';
import { sleepMsec } from 'kacheryCloudTasks/PubsubSubscription';
import { FinalizeFileUploadRequest, InitiateFileUploadRequest, InitiateFileUploadResponse, isFinalizeFileUploadResponse, isInitiateFileUploadResponse } from './GatewayRequest';
import { getKacheryCloudClientInfo } from './getKacheryCloudClientInfo';

const kacheryCloudStoreFile = async (fileData: string, kacheryGatewayUrl: string, githubAuth: {userId?: string, accessToken? : string}): Promise<string> => {
    const {clientId, keyPair} = await getKacheryCloudClientInfo()
    // const url = 'https://cloud.kacheryhub.org/api/kacherycloud'
    const url = `${kacheryGatewayUrl}/api/gateway`
    const sha1 = sha1OfString(fileData)
    const uri = `sha1://${sha1}`
    const timer = Date.now()
    let response: InitiateFileUploadResponse
    while (true) {
        const payload = {
            type: 'initiateFileUpload' as 'initiateFileUpload',
            timestamp: Date.now(),
            hashAlg: 'sha1' as 'sha1',
            hash: sha1.toString(),
            size: fileData.length
        }
        const signature = await signMessage(payload, keyPair)
        const req: InitiateFileUploadRequest = {
            payload,
            fromClientId: !githubAuth.userId ? clientId : undefined,
            signature: !githubAuth.userId ? signature : undefined,
            githubUserId: githubAuth.userId,
            githubAccessToken: githubAuth.accessToken
        }
        const x = await axios.post(url, req)
        const resp = x.data
        if (!isInitiateFileUploadResponse(resp)) {
            console.warn(resp)
            throw Error('Unexpected initiateFileUpload response')
        }
        response = resp
        const alreadyExists = response.alreadyExists
        const alreadyPending = response.alreadyPending
        if (alreadyExists) {
            return uri
        }
        else if (alreadyPending) {
            const elapsed = (Date.now() - timer) / 1000
            if (elapsed > 60) {
                throw Error(`Upload is already pending... timeout: ${uri}`)
            }
            console.info(`Upload is already pending... waiting to retry ${uri}`)
            await sleepMsec(5000)
        }
        else {
            break
        }
    }
    const signedUploadUrl = response.signedUploadUrl
    if (!signedUploadUrl) throw Error('No signedUploadUrl')
    const objectKey = response.objectKey
    if (!objectKey) throw Error('No objectKey')
    const respUpload = await axios.put(signedUploadUrl, fileData)
    if (respUpload.status !== 200) {
        throw Error(`Error uploading file to bucket (${respUpload.status}) ${respUpload.statusText}: ${uri}`)
    }
    const payload2 = {
        type: 'finalizeFileUpload' as 'finalizeFileUpload',
        timestamp: Date.now(),
        objectKey,
        hashAlg: 'sha1' as 'sha1',
        hash: sha1.toString(),
        size: fileData.length
    }
    const signature2 = await signMessage(payload2, keyPair)
    const req2: FinalizeFileUploadRequest = {
        payload: payload2,
        fromClientId: !githubAuth.userId ? clientId : undefined,
        signature: !githubAuth.userId ? signature2 : undefined,
        githubUserId: githubAuth.userId,
        githubAccessToken: githubAuth.accessToken
    }
    const x2 = await axios.post(url, req2)
    const resp2 = x2.data
    if (!isFinalizeFileUploadResponse(resp2)) {
        console.warn(resp2)
        throw Error('Unexpected finalizeFileUpload response')
    }
    const response2 = resp2
    if (response2.type !== 'finalizeFileUpload') throw Error('Unexpected')
    return uri
}

export default kacheryCloudStoreFile
import axios from 'axios';
import { isBoolean, isEqualTo, isNodeId, isNumber, isSignature, isString, NodeId, optional, Signature, _validateObject } from 'commonInterface/kacheryTypes';
import { GetMutableRequest, isGetMutableResponse } from 'types/KacherycloudRequest';

const kacheryCloudGetMutable = async (key: string, projectId: string) => {
    const url = 'https://cloud.kacheryhub.org/api/kacherycloud'
    // const url = 'http://localhost:3001/api/kacherycloud'
    const req: GetMutableRequest = {
        payload: {
            type: 'getMutable',
            timestamp: Date.now(),
            mutableKey: key,
            projectId: projectId
        }
    }
    const x = await axios.post(url, req)
    const resp = x.data
    if (!isGetMutableResponse(resp)) {
        console.warn(resp)
        throw Error('Unexpected getMutable response')
    }
    return resp.found ? resp.value : undefined
}

export default kacheryCloudGetMutable
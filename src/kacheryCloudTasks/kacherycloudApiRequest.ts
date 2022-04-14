import axios from "axios"
import { KacherycloudRequest, KacherycloudResponse } from "types/KacherycloudRequest"

const kacherycloudApiRequest = async (request: KacherycloudRequest): Promise<KacherycloudResponse> => {
    const url = (window as any).isKacheryCloudGui ? '/api/kacherycloud' : 'https://cloud.kacheryhub.org/api/kacherycloud'
    const x = await axios.post(url, request)
    return x.data
}

export default kacherycloudApiRequest
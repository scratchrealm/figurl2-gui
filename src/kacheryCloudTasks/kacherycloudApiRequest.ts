import axios, { AxiosResponse } from "axios"
import { KacherycloudRequest, KacherycloudResponse } from "types/KacherycloudRequest"
import { sleepMsec } from "./PubsubSubscription"

const kacherycloudApiRequest = async (request: KacherycloudRequest, o: {retryInterval?: number}={}): Promise<KacherycloudResponse> => {
    const url = (window as any).isKacheryCloudGui ? '/api/kacherycloud' : 'https://cloud.kacheryhub.org/api/kacherycloud'
    let x: AxiosResponse
    while (true) {
        try {
            x = await axios.post(url, request)
            if (x.status !== 200) {
                console.warn(request)
                throw Error(`Error status ${x.status} in kachery cloud request`)
            }
            break
        }
        catch(err) {
            if (o.retryInterval !== undefined) {
                console.warn(`Error in kachery cloud api request. Retrying in ${o.retryInterval} msec.`, err)
                await sleepMsec(o.retryInterval)
                // continue
            }
            else {
                throw err
            }
        }
    }
    return x.data
}

export default kacherycloudApiRequest
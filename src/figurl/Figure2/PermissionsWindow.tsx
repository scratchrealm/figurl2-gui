import { Button } from "@material-ui/core";
import axios from "axios";
import { signMessage } from "commonInterface/crypto/signatures";
import Hyperlink from "components/Hyperlink/Hyperlink";
import { sleepMsec } from "kacheryCloudTasks/PubsubSubscription";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { GetClientInfoRequest, isGetClientInfoResponse } from "types/KacherycloudRequest";
import FigureInterface from "./FigureInterface";
import { getKacheryCloudClientInfo } from "./getKacheryCloudClientInfo";
import { NodeId } from "./viewInterface/kacheryTypes";
import { JSONObject } from "./viewInterface/validateObject";

type Props = {
    figureInterface: FigureInterface
    onClose: () => void
}

const PermissionsWindow: FunctionComponent<Props> = ({figureInterface, onClose}) => {
    const {clientVerified, registerClientUrl, refresh: refreshVerifyClient, clientId} = useVerifyClient()

    useEffect(() => {
        let cancel = false
        ;(async () => {
            while (!cancel) {
                if (figureInterface.hasPermission('store-file')) {
                    onClose()
                }
                await sleepMsec(300)
            }
        })()
        return () => {
            cancel = true
        }
    }, [figureInterface, onClose])

    if (clientVerified === undefined) {
        return <div>Verifying kachery cloud client</div>
    }
    if (clientVerified === false) {
        return <div>
            <div>
                Kachery cloud client not registered.
            </div>
            <div>&nbsp;</div>
            <div>
                <Hyperlink
                    href={registerClientUrl}
                    target="_blank"
                >Register this client</Hyperlink>.&nbsp;
                Then <Hyperlink onClick={refreshVerifyClient}>click here to continue</Hyperlink>.
            </div>
        </div>
    }
    return (
        <div>
            <div>
                This application is requesting to store files using your kachery-cloud client.
                To allow this, click "Authorize" below.
            </div>
            <div>&nbsp;</div>
            <div>Client ID: <Hyperlink href={`https://cloud.kacheryhub.org/client/${clientId}`} target="_blank">{clientId?.slice(0, 6)}...</Hyperlink></div>
            <div>&nbsp;</div>
            <div>
                <Button onClick={() => {figureInterface.authorizePermission('store-file', true)}}>Authorize</Button>
            </div>
        </div>
    )
}

const useVerifyClient = () => {
    const [clientVerified, setClientVerified] = useState<boolean | undefined>(undefined)
    const [registerClientUrl, setRegisterClientUrl] = useState<string | undefined>(undefined)
    const [clientId, setClientId] = useState<string | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refresh = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    useEffect(() => {
        ;(async () => {
            const okay = await checkClientRegistered()
            setClientVerified(okay)

            const {clientId, keyPair} = await getKacheryCloudClientInfo()
            const signature = await signMessage({type: 'addClient'}, keyPair)
            const url = `https://cloud.kacheryhub.org/registerClient/${clientId}?signature=${signature}&label=figurl`
            setRegisterClientUrl(url)
            setClientId(clientId.toString())
        })()
    }, [refreshCode])
    return {clientVerified, registerClientUrl, refresh, clientId}
}

async function checkClientRegistered() {
    const {clientId, keyPair} = await getKacheryCloudClientInfo()
    const url = 'https://cloud.kacheryhub.org/api/kacherycloud'
    const payload = {
        type: 'getClientInfo' as 'getClientInfo',
        timestamp: Date.now(),
        clientId: clientId as NodeId
    }
    const signature = await signMessage(payload as any as JSONObject, keyPair)
    const req: GetClientInfoRequest = {
        payload,
        fromClientId: clientId,
        signature
    }
    const x = await axios.post(url, req)
    const resp = x.data
    if (!isGetClientInfoResponse(resp)) {
        console.warn(resp)
        throw Error('Unexpected getClientInfo response')
    }
    const response = resp
    if (!response.found) {
        console.warn('Client not found')
        return false
    }
    return true
}

export default PermissionsWindow
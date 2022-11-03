import { Button } from "@material-ui/core";
import { sleepMsec } from "kacheryCloudTasks/PubsubSubscription";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import FigureInterface, { getGithubTokenFromLocalStorage } from "./FigureInterface";
import GithubTokenControl from "./GithubTokenControl";

type Props = {
    figureInterface: FigureInterface
    onClose: () => void
    params: any
}

const GithubPermissionsWindow: FunctionComponent<Props> = ({figureInterface, onClose, params}) => {
    useEffect(() => {
        figureInterface.authorizePermission('store-github-file', params, undefined)
        let cancel = false
        ;(async () => {
            while (!cancel) {
                const p = figureInterface.hasPermission('store-github-file', params)
                if (p !== undefined) {
                    onClose()
                }
                await sleepMsec(300)
            }
        })()
        return () => {
            cancel = true
        }
    }, [figureInterface, onClose, params])

    const [, setReloadTokenCode] = useState<number>(0)
    const reloadToken = useCallback(() => {setReloadTokenCode(c => (c + 1))}, [])
    const githubToken = getGithubTokenFromLocalStorage()

    return (
        <div>
            <h3>This application is requesting to create or update the following file on Github on your behalf.</h3>
            <h3>{params.uri}</h3>
            {
                githubToken ? (
                    <span>
                        <p>To allow this, click "Authorize" below.</p>
                        <div>
                            <Button onClick={() => {figureInterface.authorizePermission('store-github-file', params, true)}}>Authorize this application</Button>
                            <Button onClick={() => {figureInterface.authorizePermission('store-github-file', params, false)}}>Cancel</Button>
                        </div>
                    </span>
                ) : (
                    <p style={{color: 'red'}}>Github access token not set.</p>
                )
            }
            <hr />
            <GithubTokenControl
                onChange={() => reloadToken()}
            />
        </div>
    )
}

export default GithubPermissionsWindow
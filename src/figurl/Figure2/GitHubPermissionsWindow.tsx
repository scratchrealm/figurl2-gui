import { Button } from "@material-ui/core";
import { useGithubAuth } from "GithubAuth/useGithubAuth";
import { sleepMsec } from "kacheryCloudTasks/PubsubSubscription";
import { FunctionComponent, useEffect } from "react";
import GitHubLoginWindow from '../MainWindow/GitHub/GitHubLoginWindow';
import FigureInterface from "./FigureInterface";

type Props = {
    figureInterface: FigureInterface
    onClose: () => void
    params: any
}

const GitHubPermissionsWindow: FunctionComponent<Props> = ({figureInterface, onClose, params}) => {
    const {signedIn} = useGithubAuth()
    useEffect(() => {
        figureInterface.authorizePermission('store-github-file', params, undefined)
        let cancel = false
        ;(async () => {
            while (!cancel) {
                const p = figureInterface.hasPermission('store-github-file', params)
                if (p !== undefined) {
                    onClose()
                }
                await sleepMsec(100)
            }
        })()
        return () => {
            cancel = true
        }
    }, [figureInterface, onClose, params])

    return (
        <div>
            <h3>This application is requesting to create or update the following file on GitHub on your behalf.</h3>
            <h3>{params.uri}</h3>
            {
                signedIn ? (
                    <span>
                        <p>To allow this, click "Authorize" below.</p>
                        <div>
                            <Button style={{color: 'green'}} onClick={() => {figureInterface.authorizePermission('store-github-file', params, true)}}>Authorize this application</Button>
                            <Button onClick={() => {figureInterface.authorizePermission('store-github-file', params, false)}}>Cancel</Button>
                        </div>
                    </span>
                ) : (
                    <p style={{color: 'red'}}>GitHub access token not set.</p>
                )
            }
            <hr />
            <GitHubLoginWindow
                defaultScope="repo"
                onChange={() => {}}
            />
            {/* <hr /> */}
            {/* {
                resetTokenVisible ? (
                    <GitHubLoginWindow
                        onChange={() => reloadToken()}
                    />
                ) : (
                    <Button onClick={() => setResetTokenVisible(true)}>Reset access token</Button>
                )
            } */}
        </div>
    )
}

export default GitHubPermissionsWindow
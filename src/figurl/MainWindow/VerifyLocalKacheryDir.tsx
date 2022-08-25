import { Button } from "@material-ui/core";
import Hyperlink from "components/Hyperlink/Hyperlink";
import { getDirectoryHandleAndVerifyPermission, resetDirectoryHandle } from "figurl/Figure2/loadLocalSha1TextFile";
import { FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from "react";

const VerifyLocalKacheryDir: FunctionComponent<PropsWithChildren<{}>> = ({children}) => {
    const [verified, setVerified] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        if (verified !== undefined) return
        ;(async () => {
            try {
                const okay = await getDirectoryHandleAndVerifyPermission()
                setVerified(okay)
            }
            catch(err) {
                setVerified(false)
            }
        })()
    }, [verified])

    const handleReset = useCallback(() => {
        resetDirectoryHandle().then(() => {
            setVerified(undefined)
        })
    }, [])

    if (verified === undefined) return <div>Checking permissions for local kachery dir</div>
    if (verified) {
        return <span>{children}</span>
    }
    else {
        return (
            <div style={{padding: 10}}>
                <h3>Permission required to access local kachery directory</h3>
                <p>You will be prompted to select the local kachery directory and/or verify access permissions.</p>
                <p>Note: you may need to show hidden folders if the kachery directory starts with [dot].</p>
                <div>
                    <Button onClick={() => setVerified(undefined)}>Continue</Button>
                </div>
                <hr />
                <div>
                    <Hyperlink onClick={handleReset}>Reset kachery directory choice</Hyperlink>
                </div>
            </div>
        )
    }
}

export default VerifyLocalKacheryDir
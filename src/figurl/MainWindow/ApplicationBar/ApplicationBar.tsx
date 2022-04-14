import { AppBar, Button, Toolbar } from '@material-ui/core';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import ModalWindow from 'components/ModalWindow/ModalWindow';
import { useRoute2 } from 'figurl/Figure2/Figure2';
import TaskMonitor from 'figurl/TaskMonitor/TaskMonitor';
import TaskMonitorControl from 'figurl/TaskMonitor/TaskMonitorControl';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import SaveFigureControl from './SaveFigureControl';
import SaveFigureDialog from './SaveFigureDialog';

const appBarHeight = 50

type Props = {
    title: string
    logo?: any
    onHome?: () => void
}

// const homeButtonStyle: React.CSSProperties = {
//     paddingBottom: 0, color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold',
//     cursor: 'pointer'
// }

export const useModalDialog = () => {
    const [visible, setVisible] = useState<boolean>(false)
    const handleOpen = useCallback(() => {
        setVisible(true)
    }, [])
    const handleClose = useCallback(() => {
        setVisible(false)
    }, [])
    return useMemo(() => ({
        visible,
        handleOpen,
        handleClose
    }), [visible, handleOpen, handleClose])
}

const ApplicationBar: FunctionComponent<Props> = ({ title, logo, onHome }) => {
    const {visible: saveFigureVisible, handleOpen: openSaveFigure, handleClose: closeSaveFigure} = useModalDialog()
    const {visible: taskMonitorVisible, handleOpen: openTaskMonitor, handleClose: closeTaskMonitor} = useModalDialog()

    // const client = useGoogleSignInClient()
    // const gapi = client?.gapi
    const {routePath} = useRoute2()

    // const signedIn = useSignedIn()
    const {signedIn, userId, gapi} = useSignedIn()
    const handleLogin = useCallback(() => {
        gapi.auth2.getAuthInstance().signIn();
    }, [gapi])
    const handleLogout = useCallback(() => {
        gapi.auth2.getAuthInstance().signOut()
        // setRoute({routePath: '/home'})
    }, [gapi])

    return (
        <span>
            <AppBar position="static" style={{height: appBarHeight, color: 'white'}}>
                <Toolbar>
                {
                    logo && (<img src={logo} alt="logo" height={30} style={{paddingBottom: 5, cursor: 'pointer'}} onClick={onHome} />)
                }
                <div>&nbsp;&nbsp;&nbsp;{title}</div>
                {/* {
                    ((routePath === '/fig') && (figureLabel)) && (
                        <span style={{paddingLeft: 20}}>{figureLabel}</span>
                    )
                } */}
                {/* {
                    ((routePath === '/doc') && (wiki)) && (
                        <span style={{paddingLeft: 20}}>{fileNameFromWiki(wiki)}</span>
                    )
                } */}
                <span style={{marginLeft: 'auto'}} />
                {
                    signedIn && (
                        <span style={{fontFamily: 'courier', color: 'lightgray'}}>{userId}</span>
                    )
                }
                {/* <span style={{paddingBottom: 0, color: 'white'}}>
                    <ProjectControl onOpen={openConfigureProject} color={projectControlColor} />
                </span> */}
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <TaskMonitorControl onOpen={openTaskMonitor} color="white" />
                </span>
                {
                    routePath === '/f' && (
                        <span style={{paddingBottom: 0, color: 'white'}}>
                            <SaveFigureControl onClick={openSaveFigure} color="white" />
                        </span>
                    )
                }
                {
                    signedIn ? (
                        <Button color="inherit" onClick={handleLogout}>Sign out</Button>
                    ) : (
                        <Button color="inherit" onClick={handleLogin}>Sign in</Button>
                    )
                }
                </Toolbar>
            </AppBar>
            <ModalWindow
                open={saveFigureVisible}
                onClose={closeSaveFigure}
            >
                <SaveFigureDialog
                    onClose={closeSaveFigure}
                />
            </ModalWindow>
            {/* <ModalWindow
                open={configureChannelVisible}
                onClose={closeConfigureChannel}
            >
                <ConfigureChannel
                    onClose={closeConfigureChannel}
                />
            </ModalWindow> */}
            <ModalWindow
                open={taskMonitorVisible}
                onClose={closeTaskMonitor}
            >
                <TaskMonitor
                    onClose={closeTaskMonitor}
                />
            </ModalWindow>
        </span>
    )
}

export default ApplicationBar
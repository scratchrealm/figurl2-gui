import { Dialog, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import { FunctionComponent, PropsWithChildren } from 'react';

const useStyles = makeStyles((theme) => ({
    paper: {
        left: 100,
        top: 100,
        right: 100,
        bottom: 100,
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        overflow: 'auto'
    },
}));

type Props = {
    open: boolean
    onClose?: () => void
}

const ModalWindow: FunctionComponent<PropsWithChildren<Props>> = ({ onClose, open, children }) => {
    const classes = useStyles();
    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            style={{zIndex: 9999}}
        >
            <div className={classes.paper} style={{zIndex: 9999}}>
                {
                    onClose && <IconButton onClick={onClose}><Close /></IconButton>
                }
                {
                    children
                }
            </div>
        </Dialog>
    )
}

export default ModalWindow
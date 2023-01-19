import { IconButton } from '@material-ui/core';
import { Album } from '@material-ui/icons';
import { FunctionComponent } from 'react';

type Props = {
    onClick: () => void
    color: any
}

const LocalKacheryControl: FunctionComponent<Props> = ({ onClick, color }) => {
    const tooltip = "Connect to local Kachery server"
    return (
        <IconButton style={{color}} title={tooltip} onClick={onClick}><Album /></IconButton>
    );
}

export default LocalKacheryControl
import { IconButton } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import { useGithubAuth } from 'GithubAuth/useGithubAuth';
import { FunctionComponent, useCallback } from 'react';

type Props = {
    onClick: () => void
    color: any
}

const SaveFigureControl: FunctionComponent<Props> = ({ onClick, color }) => {
    // const {signedIn} = useSignedIn()
    const {signedIn} = useGithubAuth()
    const tooltip = signedIn ? 'Save figure' : 'Sign in to save figure'
    const handleClick = useCallback(() => {
        if (!signedIn) {
            alert('You must be signed in to save a figure.')
            return
        }
        onClick()
    }, [signedIn, onClick])
    return (
        <IconButton style={{color}} title={tooltip} onClick={handleClick}><Save /></IconButton>
    );
}

export default SaveFigureControl
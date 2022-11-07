import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FunctionComponent } from 'react';
import { IconButton } from '@material-ui/core';

type Props = {
    onOpen: () => void
}

const GithubAccessControl: FunctionComponent<Props> = ({ onOpen }) => {
    
    return (
        <IconButton>
            <FontAwesomeIcon icon={faGithub} onClick={onOpen} />
        </IconButton>
    );
}

export default GithubAccessControl
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FunctionComponent, useEffect, useState } from 'react';
import { IconButton } from '@material-ui/core';
import { getGitHubTokenFromLocalStorage } from 'figurl/Figure2/FigureInterface';
import { GithubLoginStatus } from 'figurl/MainWindow/GitHub/GitHubLoginWindow';

type Props = {
    onOpen: () => void
}

const GitHubAccessControl: FunctionComponent<Props> = ({ onOpen }) => {
    const [loginStatus, setLoginStatus] = useState<GithubLoginStatus>({status: 'checking'})
    useEffect(() => {
		// polling
		const intervalId = setInterval(() => {
			const token = getGitHubTokenFromLocalStorage()
			if (token) {
				setLoginStatus({
					status: 'logged-in',
					accessToken: token
				})
			}
			else {
				setLoginStatus({
					status: 'not-logged-in'
				})
			}
		}, 4000)
		return () => {
			clearInterval(intervalId)
		}
	}, [])
    return (
        <IconButton onClick={onOpen}>
            <FontAwesomeIcon icon={faGithub} style={{color: loginStatus.status === 'logged-in' ? 'darkblue' : 'gray'}} />
        </IconButton>
    );
}

export default GitHubAccessControl
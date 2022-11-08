import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@material-ui/core";
import axios from "axios";
import Hyperlink from "components/Hyperlink/Hyperlink";
import { getGitHubTokenFromLocalStorage, getGitHubUserFromLocalStorage, setGitHubTokenToLocalStorage } from "figurl/Figure2/FigureInterface";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import PersonalAccessTokenWindow from "./PersonalAccessTokenWindow";

type Props ={
	onClose?: () => void
	onChange: () => void
}

export type GithubLoginStatus ={
	status: 'checking' | 'logged-in' | 'not-logged-in'
	accessToken?: string
}

const GitHubLoginWindow: FunctionComponent<Props> = ({onClose, onChange}) => {
	const [loginStatus, setLoginStatus] = useState<GithubLoginStatus>({status: 'checking'})
	const [userName, setUserName] = useState('')
	const [personalAccessTokenMode, setPersonalAccessTokenMode] = useState(false)
	const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID
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
		}, 1000)
		return () => {
			clearInterval(intervalId)
		}
	}, [])
	useEffect(() => {
		if (loginStatus.accessToken) {
			const u = getGitHubUserFromLocalStorage()
			if (u) {
				setUserName(u)
			}
			else {
				axios.get(`https://api.github.com/user`, {headers: {Authorization: `token ${loginStatus.accessToken}`}}).then(resp => {
					setGitHubTokenToLocalStorage(getGitHubTokenFromLocalStorage(), resp.data.login)
					setUserName(resp.data.login)
				})
			}
		}
	}, [loginStatus.accessToken])
	const handleClearAccessToken = useCallback(() => {
		setGitHubTokenToLocalStorage('')
		onChange()
	}, [onChange])
	if (!GITHUB_CLIENT_ID) {
		return <div>Environment variable not set: REACT_APP_GITHUB_CLIENT_ID</div>
	}
	if (loginStatus.status === 'checking') {
		return <div>Checking</div>
	}
	else if (loginStatus.status === 'not-logged-in') {
		if (personalAccessTokenMode) {
			return <PersonalAccessTokenWindow onChange={onChange} />
		}
		else {
			return (
				<div>
					<div>
						<a href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faGithub} /> Log in with GitHub</a>
					</div>
					<h3>- OR -</h3>
					<div>
						<Hyperlink onClick={() => {setPersonalAccessTokenMode(true)}}>Set a personal access token</Hyperlink>
					</div>
				</div>
			)
		}
	}
	else if (loginStatus.status === 'logged-in') {
		return (
			<div>
				<p>
					You are logged in with GitHub (user name: {userName})
				</p>
				{onClose && <Button onClick={onClose}>OK</Button>}
				<hr />
				<div>
					<Button onClick={handleClearAccessToken}>Clear access token</Button>
				</div>
				<br />
				<div style={{paddingLeft: 6, fontSize: 12}}>
					<Hyperlink href="https://github.com/settings/applications" target="_blank" style={{color: 'gray'}}>Revoke or manage access</Hyperlink>
				</div>
			</div>
		)
	}
	else {
		return <div>Unexpected login status {loginStatus.status}</div>
	}
}

export default GitHubLoginWindow

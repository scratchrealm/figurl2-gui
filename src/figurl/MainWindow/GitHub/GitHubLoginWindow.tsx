import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Checkbox, FormControlLabel } from "@material-ui/core";
import Hyperlink from "components/Hyperlink/Hyperlink";
import { useGithubAuth } from "GithubAuth/useGithubAuth";
import { FunctionComponent, useCallback, useState } from "react";
import PersonalAccessTokenWindow from "./PersonalAccessTokenWindow";

type Props ={
	onClose?: () => void
	onChange: () => void
	defaultScope: '' | 'repo'
}

export type GithubLoginStatus ={
	status: 'checking' | 'logged-in' | 'not-logged-in'
	accessToken?: string
}

const GitHubLoginWindow: FunctionComponent<Props> = ({onClose, onChange, defaultScope}) => {
	const [personalAccessTokenMode, setPersonalAccessTokenMode] = useState(false)
	const [githubScope, setGithubScope] = useState<'' | 'repo'>(defaultScope)
	const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID
	const {userId, loginStatus, clearAccessToken, isPersonalAccessToken} = useGithubAuth()
	const handleClearAccessToken = useCallback(() => {
		clearAccessToken()
		onChange()
	}, [clearAccessToken, onChange])
	if (!GITHUB_CLIENT_ID) {
		return <div>Environment variable not set: REACT_APP_GITHUB_CLIENT_ID</div>
	}
	if (loginStatus === 'checking') {
		return <div>Checking</div>
	}
	else if (loginStatus === 'not-logged-in') {
		if (personalAccessTokenMode) {
			return <PersonalAccessTokenWindow onChange={onChange} />
		}
		else {
			return (
				<div>
					<div>
					<FormControlLabel
						control={
							<Checkbox checked={githubScope === 'repo'} onClick={() => {setGithubScope(githubScope === '' ? 'repo' : '')}} />
						}
						label="Allow read/write access to repos"/>
					</div>
					<div>
						{/* <a href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faGithub} /> Log in with GitHub</a> */}
						<a
							href={
								githubScope === 'repo' ? (
									`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`
								) : (
									`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`
								)
							}
							target="_blank"
							rel="noreferrer"
						>
						<FontAwesomeIcon icon={faGithub} /> Log in with GitHub</a>
					</div>
					<h3>- OR -</h3>
					<div>
						<Hyperlink onClick={() => {setPersonalAccessTokenMode(true)}}>Set a personal access token</Hyperlink>
					</div>
				</div>
			)
		}
	}
	else if (loginStatus === 'logged-in') {
		return (
			<div>
				<p>
					You are logged in with GitHub (user name: {userId})
				</p>
				{onClose && <Button onClick={onClose}>OK</Button>}
				<hr />
				<div>
					<Button onClick={handleClearAccessToken}>Clear access token</Button>
				</div>
				<br />
				{
					isPersonalAccessToken ? (
						<div style={{paddingLeft: 6, fontSize: 12}}>
							<Hyperlink href="https://github.com/settings/apps" target="_blank" style={{color: 'gray'}}>Revoke or manage personal access token</Hyperlink>
						</div>
					) : (
						<div style={{paddingLeft: 6, fontSize: 12}}>
							<Hyperlink href="https://github.com/settings/applications" target="_blank" style={{color: 'gray'}}>Revoke or manage access</Hyperlink>
						</div>
					)
				}
			</div>
		)
	}
	else {
		return <div>Unexpected login status {loginStatus}</div>
	}
}

export default GitHubLoginWindow

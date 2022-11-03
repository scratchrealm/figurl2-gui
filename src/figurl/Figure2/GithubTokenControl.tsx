import { Button, Input } from "@material-ui/core";
import { FunctionComponent, useCallback, useState } from "react";
import { getGithubTokenFromLocalStorage, setGithubTokenToLocalStorage } from "./FigureInterface";

type Props ={
	onChange: () => void
}

const GithubTokenControl: FunctionComponent<Props> = ({onChange}) => {
	const [, setReloadTokenCode] = useState<number>(0)
    const reloadToken = useCallback(() => {setReloadTokenCode(c => (c + 1))}, [])
    const githubToken = getGithubTokenFromLocalStorage()

	const [editBoxVisible, setEditBoxVisible] = useState(false)
	const [newToken, setNewToken] = useState('')

	const handleNewTokenChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback((e) => {
        setNewToken(e.target.value as string)
	}, [])

	const handleSubmit = useCallback(() => {
		setGithubTokenToLocalStorage(newToken)
		setNewToken('')
		setEditBoxVisible(false)
		reloadToken()
		onChange()
	}, [newToken, onChange, reloadToken])

	return (
		<div>
			{
				!editBoxVisible ? (
					githubToken ? (
						<span>
							<p style={{color: 'green'}}>Github personal access token has been set.</p>
							<Button onClick={() => setEditBoxVisible(true)}>Reset access token</Button>
						</span>
					) : (
						<span>
							<p style={{color: 'red'}}>Github personal access token not set.</p>
							<Button onClick={() => setEditBoxVisible(true)}>Set access token</Button>
						</span>
					)
				) : (
					<span>
						<p>
							Obtain a Github <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank" rel="noreferrer">personal access token</a> and then paste it below.
						</p>
						<p style={{fontWeight: 'bold'}}>
							Use the classic type personal access token with repo scope.
						</p>
						<Input title="Github personal access token" type="text" value={newToken} onChange={handleNewTokenChange} />
						{
							newToken && (
								<Button onClick={handleSubmit}>Submit</Button>
							)
						}
					</span>
				)
			}
		</div>
	)
}

export default GithubTokenControl

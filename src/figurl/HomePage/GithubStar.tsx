import { FunctionComponent } from "react";

type Props ={
}

const GithubStar: FunctionComponent<Props> = () => {
	return (
		<div style={{display: 'flex', alignItems: 'center'}}>
			<iframe src="https://ghbtns.com/github-btn.html?user=flatironinstitute&repo=figurl&type=star&count=true" scrolling="0" width="78" height="20" title="GitHub"></iframe>
			<span style={{fontSize: 12, marginLeft: 4}}>
				Star us on GitHub.
			</span>
		</div>
	)
}

export default GithubStar

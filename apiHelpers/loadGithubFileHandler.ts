import axios from "axios";
import { LoadGithubFileRequest, LoadGithubFileResponse } from "../src/types/GithubRequest";

const loadGithubFileHandler = async (request: LoadGithubFileRequest): Promise<LoadGithubFileResponse> => {
    const { userName, repoName, branchName, fileName } = request
    const url = `https://raw.githubusercontent.com/${userName}/${repoName}/${branchName}/${fileName}`
    // thanks: https://github.com/axios/axios/issues/907#issuecomment-506924322
    const resp = await axios.get(url, {responseType: 'text', transformResponse: [(data) => { return data; }]})
    const content = resp.data
    if (!content) throw Error('No content')
    return {
        type: 'loadGithubFile',
        content
    }
}

export default loadGithubFileHandler
import axios from "axios";
import { LoadGistFileRequest, LoadGistFileResponse } from "../src/types/GithubRequest";

const loadGistFileHandler = async (request: LoadGistFileRequest): Promise<LoadGistFileResponse> => {
    const { userName, gistId, fileName } = request
    const url = `https://gist.githubusercontent.com/${userName}/${gistId}/raw/${fileName}`
    // thanks: https://github.com/axios/axios/issues/907#issuecomment-506924322
    const resp = await axios.get(url, {responseType: 'text', transformResponse: [(data) => { return data; }]})
    const content = resp.data
    if (!content) throw Error('No content')
    return {
        type: 'loadGistFile',
        content
    }
}

export default loadGistFileHandler
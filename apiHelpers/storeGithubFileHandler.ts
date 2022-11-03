import octonode from 'octonode';
import { sha1OfString } from '../src/commonInterface/kacheryTypes';
import { StoreGithubFileRequest, StoreGithubFileResponse } from "../src/types/GithubRequest";

const storeGithubFileHandler = async (request: StoreGithubFileRequest): Promise<StoreGithubFileResponse> => {
    const { userName, repoName, branchName, fileName, content, githubToken } = request

    const client = octonode.client(githubToken)

    const repo = client.repo(`${userName}/${repoName}`)

    let contents
    try {
        contents = await repo.contentsAsync(fileName, branchName)
    }
    catch {
        contents = undefined
    }
    
    if (contents) {
        const sha = contents[0].sha

        const message = `Update ${fileName}`
        const r = await repo.updateContentsAsync(fileName, message, content, sha, branchName)
    }
    else {
        const message = `Create ${fileName}`
        const r = await repo.createContentsAsync(fileName, message, content, branchName)
    }
    return {
        type: 'storeGithubFile',
        success: true
    }
}

export default storeGithubFileHandler
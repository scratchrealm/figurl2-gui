import { VercelRequest, VercelResponse } from '@vercel/node'
import loadGistFileHandler from '../apiHelpers/loadGistFileHandler'
import loadGithubFileHandler from '../apiHelpers/loadGithubFileHandler'
import storeGithubFileHandler from '../apiHelpers/storeGithubFileHandler'
import { isGithubRequest } from '../src/types/GithubRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const {body: requestBody} = req
    if (!isGithubRequest(requestBody)) {
        console.warn('Invalid request body', requestBody)
        res.status(400).send(`Invalid request body: ${JSON.stringify(requestBody)}`)
        return
    }
    ;(async () => {
        if (requestBody.type === 'loadGistFile') {
            return await loadGistFileHandler(requestBody)
        }
        else if (requestBody.type === 'loadGithubFile') {
            return await loadGithubFileHandler(requestBody)
        }
        else if (requestBody.type === 'storeGithubFile') {
            return await storeGithubFileHandler(requestBody)
        }
        else {
            throw Error(`Unexpected github request: ${requestBody.type}`)
        }
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}

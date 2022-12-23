import axios from 'axios';
import * as http from 'http';

export const zenodoDownloadUrl = async (recordId: string, fileName: string, o: {sandbox: boolean}) => {
    console.info(`Zenodo: ${recordId}/${fileName}`)
    const url1 = `https://${o.sandbox ? 'sandbox.zenodo.org' : 'zenodo.org'}/api/records/${recordId}`
    const x = await axios.get(url1, {responseType: 'json'})
    const resp = x.data
    if (!resp.files) throw Error('Error getting zenodo record json')
    const aa = resp['files'].filter((f: any) => (f.filename === fileName))[0]
    if (!aa) throw Error(`File not found in zenodo record: ${fileName}`)
    const url: string = (aa['links'] || {})['download']
    if (!url) throw Error(`Url link not found in zenodo record: ${fileName}`)
    return url
}

const zenodoDownload = async (recordId: string, fileName: string, onProgress: (a: {loaded: number, total: number}) => void, o: {sandbox: boolean}): Promise<string> => {
    const url = await zenodoDownloadUrl(recordId, fileName, o)
    let timestampProgress = Date.now()
    let firstProgress = true
    return new Promise((resolve, reject) => {
        http.get(url, response => {
            const chunks: Uint8Array[] = []
            let numBytesDownloaded = 0
            
            response.on('data', (chunk: Uint8Array) => {
                numBytesDownloaded += chunk.byteLength
                chunks.push(chunk)
                if (onProgress) {
                    const loaded = numBytesDownloaded
                    const total = parseInt(response.headers['content-length'] || '0')
                    const elapsedSec = (Date.now() - timestampProgress) / 1000
                    if ((elapsedSec >= 0.5) || (firstProgress)) {
                        onProgress({loaded, total})
                        timestampProgress = Date.now()
                        firstProgress = false
                    }
                }
            })
            response.on('end', () => {
                const data = Buffer.concat(chunks)
                const txt = new TextDecoder().decode(data)
                resolve(txt)
            })
            response.on('error', err => {
                reject(err)
            })
        })
    })
}

export default zenodoDownload
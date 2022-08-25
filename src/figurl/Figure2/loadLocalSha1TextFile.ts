import { get, set, del } from 'idb-keyval'

export async function getDirectoryHandleAndVerifyPermission() {
    const dirHandle = await getDirectoryHandle()
    const okay = await verifyPermission(dirHandle, false)
    return okay ? dirHandle : undefined
}

export async function resetDirectoryHandle() {
    await del('kachery-cloud-dir')
}

export async function getDirectoryHandle() {
    let dirHandleOrUndefined = await get('kachery-cloud-dir');
    if (dirHandleOrUndefined) {
        console.info(`Retrieved file handle "${dirHandleOrUndefined.name}" from IndexedDB.`)
        return dirHandleOrUndefined
    }
    const dirHandle = await (window as any).showDirectoryPicker()
    await set('kachery-cloud-dir', dirHandle);
    console.info(`Stored directory handle for "${dirHandle.name}" in IndexedDB.`)
    return dirHandle
}

export async function verifyPermission(fileHandle: any, readWrite: boolean) {
    const options = {
        mode: readWrite ? 'readwrite' : undefined
    }
    // Check if permission was already granted. If so, return true.
    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }
    // Request permission. If the user grants permission, return true.
    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }
    // The user didn't grant permission, so return false.
    return false;
}

async function loadSubdirectory(dirHandle: any, path: string) {
    const a = path.split('/')
    if (a.length === 0) throw Error('Unexpected error in loadSubdirectory')
    let handle = dirHandle
    for (let i = 0; i < a.length; i++) {
        const entries = await handle.values()
        let found = false
        for await (const entry of entries) {
            if (!found) {
                if (entry.kind === 'directory') {
                    if (entry.name === a[i]) {
                        handle = entry
                        found = true
                    }
                }
            }
        }
        if (!found) return undefined
    }
    return handle
}

async function loadFileInDir(dirHandle: any, fileName: string) {
    const entries = await dirHandle.values()
    for await (const entry of entries) {
        if (entry.kind === 'file') {
            if (entry.name === fileName) {
                const handle = await entry.getFile()
                return handle
            }
        }
    }
    return undefined
}

const loadLocalSha1TextFile = async (sha1: string): Promise<string | undefined> => {
    const dirHandle = await getDirectoryHandleAndVerifyPermission()
    if (!dirHandle) {
        throw Error('Unable to verify permissions for local kachery directory')
    }
    const s = sha1
    const subdirHandle = await loadSubdirectory(dirHandle, `sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}`)
    if (!subdirHandle) return undefined
    const fileHandle = await loadFileInDir(subdirHandle, sha1)
    if (!fileHandle) return undefined
    const contents = await fileHandle.text()
    return contents
}

export default loadLocalSha1TextFile
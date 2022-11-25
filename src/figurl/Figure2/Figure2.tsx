import useGoogleSignInClient from 'components/googleSignIn/useGoogleSignInClient';
import { randomAlphaString } from 'components/misc/randomAlphaString';
import ModalWindow from 'components/ModalWindow/ModalWindow';
import { useLocalMode } from 'figurl/FigurlSetup';
import { useModalDialog } from 'figurl/MainWindow/ApplicationBar/ApplicationBar';
import RoutePath, { isRoutePath } from 'figurl/MainWindow/RoutePath';
import useBackendId from 'figurl/useBackendId';
import { useKacheryCloudTaskManager } from 'kacheryCloudTasks/context/KacheryCloudTaskManagerContext';
import deserializeReturnValue from 'kacheryCloudTasks/deserializeReturnValue';
import QueryString from 'querystring';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import FigureInterface, { loadGitHubFileDataFromUri } from './FigureInterface';
import ipfsDownload, { fileDownload } from './fileDownload';
import getZoneInfo from './getZoneInfo';
import GitHubPermissionsWindow from './GitHubPermissionsWindow';
import PermissionsWindow from './PermissionsWindow';
import ProgressComponent from './ProgressComponent';
import urlFromUri from './urlFromUri';
import zenodoDownload from './zenodoDownload';

type Props = {
    width: number
    height: number
    setFigureInterface: (x: FigureInterface) => void
}

type Progress = {
    onProgress: (callback: (a: {loaded: number, total: number}) => void) => void
}

export const useFigureData = (dataUri: string | undefined, kacheryGatewayUrl: string | undefined, githubAuth: {userId?: string, accessToken?: string}) => {
    const [figureData, setFigureData] = useState<any>()
    const [figureDataSize, setFigureDataSize] = useState<number | undefined>()
    const {progress, reportProgress} = useMemo(() => {
        let _callback: (a: {loaded: number, total: number}) => void = ({loaded, total}) => {}
        const reportProgress = (a: {loaded: number, total: number}) => {
            if (a.total) setFigureDataSize(a.total)
            _callback(a)
        }
        const progress: Progress = {
            onProgress: (callback: (a: {loaded: number, total: number}) => void) => {
                _callback = callback
            }
        }
        return {progress, reportProgress}
    }, [])
    const localMode = useLocalMode()
    useEffect(() => {
        if (!kacheryGatewayUrl) return
        ;(async () => {
            if (!dataUri) return
            let data
            if (dataUri.startsWith('ipfs://')) {
                const a = dataUri.split('?')[0].split('/')
                const cid = a[2]
                if (localMode) throw Error('Cannot load ipfs file in local mode')
                data = await ipfsDownload(cid)
            }
            else if (dataUri.startsWith('sha1://')) {
                const a = dataUri.split('?')[0].split('/')
                const sha1 = a[2]
                data = await fileDownload('sha1', sha1, kacheryGatewayUrl, reportProgress, githubAuth, {localMode, parseJson: true})
            }
            else if (dataUri.startsWith('sha1-enc://')) {
                const a = dataUri.split('?')[0].split('/')
                const sha1_enc_path = a[2]
                data = await fileDownload('sha1-enc', sha1_enc_path, kacheryGatewayUrl, reportProgress, githubAuth, {localMode, parseJson: true})
            }
            else if (dataUri.startsWith('gh://')) {
                const {content} = await loadGitHubFileDataFromUri(dataUri)
                data = JSON.parse(content)
            }
            else if ((dataUri.startsWith('zenodo://')) || (dataUri.startsWith('zenodo-sandbox://'))) {
                const a = dataUri.split('?')[0].split('/')
                const recordId = a[2]
                const fileName = a.slice(3).join('/')
                data = await zenodoDownload(recordId, fileName, reportProgress, {sandbox: dataUri.startsWith('zenodo-sandbox://')})
            }
            else {
                throw Error(`Unexpected data URI: ${dataUri}`)
            }
            data = await deserializeReturnValue(data)
            setFigureData(data)
        })()
    }, [dataUri, reportProgress, localMode, kacheryGatewayUrl, githubAuth])
    return {figureData, progress, figureDataUri: dataUri, figureDataSize}
}

export const useRoute2 = () => {
    const url = window.location.href
    const location = useLocation()
    const history = useHistory()

    const p = location.pathname
    const routePath: RoutePath = isRoutePath(p) ? p : '/home'

    // const history = useHistory()
    const qs = location.search.slice(1)
    const query = useMemo(() => (QueryString.parse(qs)), [qs]);
    const viewUri = query.v ? query.v as string : undefined
    let viewUrl = viewUri
    let viewUrlBase = viewUrl
    if ((viewUrl) && (viewUrl.startsWith('gs://'))) {
        viewUrlBase = urlFromUri(viewUrl)
        viewUrl = viewUrlBase + '/index.html'
    }
    const figureDataUri = query.d ? query.d as string : undefined
    const projectId = query.project ? query.project as string : undefined
    const backendId = query.backend ? query.backend as string : undefined
    const label = query.label ? query.label as any as string : ''
    const zone: string | undefined = query.zone ? query.zone as any as string : undefined

    const setRoute = useCallback((o: {routePath?: RoutePath, dataUri?: string, projectId?: string, label?: string}) => {
        // const query2 = {...query}
        const query2: {[key: string]: string} = {}
        let pathname2 = location.pathname
        if (o.routePath) pathname2 = o.routePath
        if (o.dataUri !== undefined) {
            query2.d = o.dataUri
        }
        if (o.label) {
            query2.label = o.label
        }
        if (o.projectId !== undefined) query2.project = o.projectId
        const search2 = queryString(query2)
        history.push({...location, pathname: pathname2, search: search2})
    }, [location, history])

    return {url, routePath, setRoute, queryString: qs, viewUri, viewUrl, viewUrlBase, figureDataUri, projectId, backendId, label, zone}
}

const Figure2: FunctionComponent<Props> = ({width, height, setFigureInterface}) => {
    const {viewUrl, figureDataUri, projectId, zone} = useRoute2()
    const {backendIdForProject} = useBackendId()
    const backendId = projectId ? backendIdForProject(projectId) : null
    const [figureInterface, setFigureInterfaceInternal] = useState<FigureInterface | undefined>()
    const iframeElement = useRef<HTMLIFrameElement | null>()
    const googleSignInClient = useGoogleSignInClient()
    const taskManager = useKacheryCloudTaskManager()
    const [progressValue, setProgressValue] = useState<{loaded: number, total: number} | undefined>(undefined)
    const {visible: permissionsWindowVisible, handleOpen: openPermissionsWindow, handleClose: closePermissionsWindow} = useModalDialog()
    const {visible: githubPermissionsWindowVisible, handleOpen: openGitHubPermissionsWindow, handleClose: closeGitHubPermissionsWindow} = useModalDialog()
    const [kacheryGatewayUrl, setKacheryGatewayUrl] = useState<string | undefined>()
    const {figureData, progress, figureDataSize} = useFigureData(figureDataUri, kacheryGatewayUrl, figureInterface ? figureInterface.githubAuth : {})
    const [permissionsParams, setPermissionsParams] = useState<any>()

    useEffect(() => {
        progress.onProgress(({loaded, total}) => {
            setProgressValue({loaded, total})
        })
    }, [progress])
    useEffect(() => {
        if (zone) {
            getZoneInfo(zone).then(resp => {
                if (!resp.found) {
                    throw Error(`Unrecognized zone: ${zone}`)
                }
                setKacheryGatewayUrl(resp.kacheryGatewayUrl)
            })
        }
        else {
            setKacheryGatewayUrl(`https://kachery-gateway.figurl.org`)
        }
    }, [zone])
    const location = useLocation()
    const history = useHistory()
    const qs = location.search.slice(1)
    const query = useMemo(() => (QueryString.parse(qs)), [qs])
    const localMode = useLocalMode()
    useEffect(() => {
        if (!figureData) return
        if (!viewUrl) return
        if (!googleSignInClient) return
        if (!kacheryGatewayUrl) return
        const id = randomAlphaString(10)
        const figureInterface = new FigureInterface({
            projectId,
            backendId,
            figureId: id,
            viewUrl,
            figureData,
            figureDataUri,
            figureDataSize,
            iframeElement,
            googleSignInClient,
            taskManager,
            localMode,
            kacheryGatewayUrl
        })
        setFigureInterfaceInternal(figureInterface)
        setFigureInterface(figureInterface)

        return () => {
            figureInterface.close()
        }
    }, [viewUrl, figureData, projectId, backendId, googleSignInClient, taskManager, localMode, setFigureInterface, figureDataSize, figureDataUri, kacheryGatewayUrl])

    const handleSetUrlState = useCallback((state: {[key: string]: any}) => {
        const newLocation = {
            ...location,
            search: adjustQueryStringForState(location.search, state)
        }
        history.push(newLocation)
    }, [location, history])

    useEffect(() => {
        if (!figureInterface) return
        figureInterface.onRequestPermissions((purpose, params) => {
            if (purpose === 'store-file') {
                setPermissionsParams(params)
                openPermissionsWindow()
            }
            else if (purpose === 'store-github-file') {
                setPermissionsParams(params)
                openGitHubPermissionsWindow()
            }
        })
        figureInterface.onSetUrlState(handleSetUrlState)
    }, [figureInterface, openPermissionsWindow, openGitHubPermissionsWindow, handleSetUrlState])

    const parentOrigin = window.location.protocol + '//' + window.location.host
    let src = useMemo(() => {
        if (!figureInterface) return ''
        let src = `${viewUrl}?parentOrigin=${parentOrigin}&figureId=${figureInterface.figureId}`
        if (query.s) {
            src += `&s=${query.s}`
        }
        return src
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [figureInterface, parentOrigin, viewUrl]) // intentionally exclude query.s from dependencies so we don't get a refresh when state changes

    if (!figureData) {
        if (!figureDataUri) {
            if (viewUrl === 'gs') {
                return <div style={{padding: 20}}>The URL appears to have been truncated. This can happen on some phones when scanning a QR code. The solution is to copy the URL to the clipboard and then paste it into the browser address bar.</div>
            }
            else {
                return <div style={{padding: 20}}>No data "d" query parameter specified for this figure.</div>
            }
        }
        return (
            <ProgressComponent
                loaded={progressValue?.loaded}
                total={progressValue?.total}
            />
        )
    }
    if (!figureInterface) {
        return <div>Waiting for figure interface</div>
    }
    return (
        <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
            <iframe
                ref={e => {iframeElement.current = e}}
                title="figure"
                src={src}
                width={width}
                height={height}
            />
            <ModalWindow
                open={permissionsWindowVisible}
                onClose={undefined}
            >
                <PermissionsWindow
                    onClose={closePermissionsWindow}
                    figureInterface={figureInterface}
                />
            </ModalWindow>
            <ModalWindow
                open={githubPermissionsWindowVisible}
                onClose={undefined}
            >
                <GitHubPermissionsWindow
                    onClose={closeGitHubPermissionsWindow}
                    figureInterface={figureInterface}
                    params={permissionsParams}
                />
            </ModalWindow>
        </div>
    )
}

const adjustQueryStringForState = (querystr: string, state: {[key: string]: any}) => {
    const qs = querystr.slice(1)
    const query = QueryString.parse(qs)
    query.s = JSON.stringify(state)
    return queryString(query)
}

const queryString = (params: { [key: string]: string | string[] }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            const v = params[key]
            if (typeof(v) === 'string') {
                return encodeURIComponent(key) + '=' + v
            }
            else {
                return v.map(a => (encodeURIComponent(key) + '=' + a)).join('&')
            }
        }).join('&')
    )
}

export default Figure2
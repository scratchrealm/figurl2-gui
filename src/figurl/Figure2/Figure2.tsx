import useGoogleSignInClient from 'components/googleSignIn/useGoogleSignInClient';
import { randomAlphaString } from 'components/misc/randomAlphaString';
import RoutePath, { isRoutePath } from 'figurl/MainWindow/RoutePath';
import useBackendId from 'figurl/useBackendId';
import { useKacheryCloudTaskManager } from 'kacheryCloudTasks/context/KacheryCloudTaskManagerContext';
import deserializeReturnValue from 'kacheryCloudTasks/deserializeReturnValue';
import QueryString from 'querystring';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import FigureInterface from './FigureInterface';
import ipfsDownload, { fileDownload } from './ipfsDownload';
import urlFromUri from './urlFromUri';

type Props = {
    width: number
    height: number
}

export const useFigureData = (dataUri: string | undefined) => {
    const [figureData, setFigureData] = useState<any>()
    useEffect(() => {
        ;(async () => {
            if (!dataUri) return
            let data
            if (dataUri.startsWith('ipfs://')) {
                const a = dataUri.split('?')[0].split('/')
                const cid = a[2]
                data = await ipfsDownload(cid)
            }
            else if (dataUri.startsWith('sha1://')) {
                const a = dataUri.split('?')[0].split('/')
                const sha1 = a[2]
                data = await fileDownload('sha1', sha1)
            }
            else if (dataUri.startsWith('sha1-enc://')) {
                const a = dataUri.split('?')[0].split('/')
                const sha1_enc_path = a[2]
                data = await fileDownload('sha1-enc', sha1_enc_path)
            }
            else {
                throw Error(`Unexpected data URI: ${dataUri}`)
            }
            data = await deserializeReturnValue(data)
            setFigureData(data)
        })()
    }, [dataUri])
    return figureData
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
    const label = query.label ? query.label as any as string : 'untitled'

    const setRoute = useCallback((o: {routePath?: RoutePath, dataUri?: string, projectId?: string, label?: string}) => {
        const query2 = {...query}
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
    }, [location, history, query])

    return {url, routePath, setRoute, queryString: qs, viewUri, viewUrl, viewUrlBase, figureDataUri, projectId, label}
}

const Figure2: FunctionComponent<Props> = ({width, height}) => {
    const {viewUrl, figureDataUri, projectId} = useRoute2()
    const {backendIdForProject} = useBackendId()
    const backendId = projectId ? backendIdForProject(projectId) : null
    const figureData = useFigureData(figureDataUri)
    const [figureId, setFigureId] = useState<string>()
    const iframeElement = useRef<HTMLIFrameElement | null>()
    const googleSignInClient = useGoogleSignInClient()
    const taskManager = useKacheryCloudTaskManager()
    useEffect(() => {
        if (!figureData) return
        if (!viewUrl) return
        if (!googleSignInClient) return
        const id = randomAlphaString(10)
        new FigureInterface({
            projectId,
            backendId,
            figureId: id,
            viewUrl,
            figureData,
            iframeElement,
            googleSignInClient,
            taskManager
        })
        setFigureId(id)
    }, [viewUrl, figureData, projectId, backendId, googleSignInClient, taskManager])
    if (!figureData) {
        return <div>Waiting for figure data</div>
    }
    if (!figureId) {
        return <div>Waiting for figure ID</div>
    }
    const parentOrigin = window.location.protocol + '//' + window.location.host
    return (
        <iframe
            ref={e => {iframeElement.current = e}}
            title="figure"
            src={`${viewUrl}?parentOrigin=${parentOrigin}&figureId=${figureId}`}
            width={width}
            height={height - 10} // we don't want the scrollbar to appear
        />
    )
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
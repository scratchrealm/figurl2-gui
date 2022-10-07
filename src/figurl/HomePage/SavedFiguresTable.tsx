import { UserId } from 'commonInterface/kacheryTypes';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import Hyperlink from 'components/Hyperlink/Hyperlink';
import NiceTable from 'components/NiceTable/NiceTable';
import { computeSizeStringFromFileManifest } from 'figurl/MainWindow/ApplicationBar/SaveFigureDialog';
import { DeleteFigureRequest, Figure, GetFiguresRequest, isDeleteFigureResponse, isGetFiguresResponse } from 'miscTypes/FigureRequest';
import postFigureRequest from 'miscTypes/postFigureRequest';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

type Props = {

}

const useFigures = (userId: UserId | null | undefined, googleIdToken: string | undefined) => {
    const [figures, setFigures] = useState<Figure[] | undefined>(undefined)
    const [updateCode, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    useEffect(() => {
        setFigures(undefined)
        if (!userId) return
        if (!googleIdToken) return
        let canceled = false
        ;(async () => {
            const req: GetFiguresRequest = {
                type: 'getFigures',
                ownerId: userId.toString(),
                auth: {
                    userId: userId.toString(),
                    googleIdToken
                }
            }
            const resp = await postFigureRequest(req, {reCaptcha: false})
            if (!isGetFiguresResponse(resp)) {
                throw Error('Unexpected response to getFigures')
            }
            if (canceled) return
            setFigures(resp.figures.sort((a, b) => (b.timestampCreated - a.timestampCreated)))
        })()
        return (() => {
            canceled = true
        })
    }, [userId, updateCode, googleIdToken])
    const refreshFigures = useCallback(() => {
        incrementUpdateCode()
    }, [incrementUpdateCode])
    const deleteFigure = useCallback((figureId: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            const req: DeleteFigureRequest = {
                type: 'deleteFigure',
                figureId,
                auth: {
                    userId: userId.toString(),
                    googleIdToken
                }
            }
            const resp = await postFigureRequest(req, {reCaptcha: true})
            if (!isDeleteFigureResponse(resp)) {
                throw Error('Unexpected response to deleteFigure')
            }
            refreshFigures()
        })()
    }, [refreshFigures, userId, googleIdToken])
    return {figures, deleteFigure, refreshFigures}
}

const columns = [
    {
        key: 'label',
        label: 'Label'
    },
    {
        key: 'timestampCreated',
        label: 'Created'
    },
    {
        key: 'viewUri',
        label: 'View'
    },
    {
        key: 'size',
        label: 'Size'
    },
    {
        key: 'notes',
        label: 'Notes'
    }
]

const SavedFiguresTable: FunctionComponent<Props> = () => {
    const {userId, googleIdToken} = useSignedIn()
    const {figures, deleteFigure} = useFigures(userId, googleIdToken)
    const rows = useMemo(() => (
        figures ? figures.map(figure => {
            const qsParts: string[] = []
            qsParts.push(`v=${figure.viewUri}`)
            qsParts.push(`d=${figure.dataUri}`)
            if (figure.urlState) qsParts.push(`s=${JSON.stringify(figure.urlState)}`)
            qsParts.push(`label=${figure.label}`)
            const qs = qsParts.join('&')
            return {
                key: figure.figureId || '',
                columnValues: {
                    label: {
                        text: figure.label,
                        element: <Hyperlink href={`/f?${qs}`}>{figure.label || '<no label>'}</Hyperlink>
                    },
                    timestampCreated: timeSince(figure.timestampCreated),
                    viewUri: figure.viewUri,
                    size: computeSizeStringFromFileManifest(figure.fileManifest),
                    notes: figure.notes
                }
            }
        }) : []
    ), [figures])

    const handleDeleteFigure = useCallback((figureId: string) => {
        deleteFigure(figureId)
    }, [deleteFigure])

    return (
        <div>
            <h2>Saved figures</h2>
            <NiceTable
                rows={rows}
                columns={columns}
                onDeleteRow={handleDeleteFigure}
            />
        </div>
    )
}

// thanks https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: number) {
    var seconds = Math.floor((Date.now() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

export default SavedFiguresTable
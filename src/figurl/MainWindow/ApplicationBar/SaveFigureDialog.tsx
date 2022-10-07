import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import { useRoute2 } from 'figurl/Figure2/Figure2';
import FigureInterface from 'figurl/Figure2/FigureInterface';
import formatByteCount from 'figurl/Figure2/formatByteCount';
import { AddFigureRequest, isAddFigureResponse } from 'miscTypes/FigureRequest';
import postFigureRequest from 'miscTypes/postFigureRequest';
import QueryString from 'querystring';
import React, { FunctionComponent, useCallback, useState } from 'react';
import EditDescriptionControl from './EditDescriptionControl';
import EditLabelControl from './EditLabelControl';
import FileManifestTable from './FileManifestTable';

type Props = {
    onClose: () => void
    figureInterface?: FigureInterface
}

const SaveFigureDialog: FunctionComponent<Props> = ({onClose, figureInterface}) => {
    const {queryString, viewUri, figureDataUri, label} = useRoute2()
    const {userId, googleIdToken} = useSignedIn()
    const [editLabel, setEditLabel] = useState<string>(label || 'untitled')
    const [notes, setNotes] = useState<string>('')
    
    const handleSave = useCallback(() => {
        if (!userId) return
        if (!googleIdToken) return
        if (!figureDataUri) return
        if (!viewUri) return
        const query = QueryString.parse(queryString)
        const urlStateString = query.s as (string | undefined)
        const urlState = urlStateString ? JSON.parse(urlStateString) : undefined
        ;(async () => {
            const req: AddFigureRequest = {
                type: 'addFigure',
                ownerId: userId.toString(),
                dataUri: figureDataUri,
                viewUri,
                urlState,
                label: editLabel,
                fileManifest: figureInterface?.fileManifest() || [],
                notes,
                auth: {
                    userId: userId.toString(),
                    googleIdToken
                }
            }
            const resp = await postFigureRequest(req, {reCaptcha: true})
            if (!isAddFigureResponse(resp)) {
                throw Error('Invalid response to addFigure')
            }
            if (!resp.figureId) {
                throw Error('Problem with figureId')
            }
            onClose()
        })()
    }, [figureDataUri, editLabel, queryString, userId, googleIdToken, onClose, viewUri, notes, figureInterface])
    return (
        <div style={{overflowY: 'auto'}}>
            <h1>Save figure</h1>
            <p style={{fontStyle: 'italic'}}>The save button is at the bottom of this window</p>
            <h3>Figure properties</h3>
            <Table>
                <TableBody className="NiceTable2">
                    <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell><EditLabelControl label={editLabel} setLabel={setEditLabel} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>View URI</TableCell>
                        <TableCell>{viewUri}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Data URI</TableCell>
                        <TableCell>{figureDataUri}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>{userId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Notes</TableCell>
                        <TableCell><EditDescriptionControl description={notes} setDescription={setNotes} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Size</TableCell>
                        <TableCell>{computeSizeStringFromFileManifest(figureInterface?.fileManifest() || [])}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <h3>File manifest</h3>
            {
                figureInterface && (
                    <FileManifestTable
                        fileManifest={figureInterface.fileManifest()}
                    />
                )
            }
            <h3>Save</h3>
            <Button style={{color: 'green'}} onClick={handleSave}>
                Save figure
            </Button>
            <p style={{fontStyle: 'italic'}}>This figure will appear in the list of figures on the figurl home page.</p>
        </div>
    )
}

export const computeSizeStringFromFileManifest = (fileManifest: {uri: string, name?: string, size?: number}[]) => {
    const totalSize = fileManifest.map(a => (a.size || 0)).reduce((sum, x) => (sum + x), 0)
    return `${formatByteCount(totalSize)} bytes (${fileManifest.length} files)`
}

export default SaveFigureDialog
import KacheryCloudTaskManager from '../KacheryCloudTaskManager';
import React, { FunctionComponent, useEffect, useState } from 'react';
import KacheryCloudTaskManagerContext from './KacheryCloudTaskManagerContext';

type Props = {
    projectId: string
    backendId?: string
}

const KacheryCloudTaskManagerSetup: FunctionComponent<Props> = (props) => {
    const [manager, setManager] = useState<KacheryCloudTaskManager | undefined>(undefined)
    useEffect(() => {
        const m = new KacheryCloudTaskManager({projectId: props.projectId, backendId: props.backendId})
        setManager(m)
        return () => {
            m.unsubscribe()
        }
    }, [props.projectId, props.backendId])
    return (
        <KacheryCloudTaskManagerContext.Provider value={manager}>
            {props.children}
        </KacheryCloudTaskManagerContext.Provider>
    )
}

export default KacheryCloudTaskManagerSetup
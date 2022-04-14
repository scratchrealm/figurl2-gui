import KacheryCloudTaskManager from '../KacheryCloudTaskManager';
import React, { FunctionComponent, useEffect, useState } from 'react';
import KacheryCloudTaskManagerContext from './KacheryCloudTaskManagerContext';

type Props = {
    projectId: string
}

const KacheryCloudTaskManagerSetup: FunctionComponent<Props> = (props) => {
    const [manager, setManager] = useState<KacheryCloudTaskManager | undefined>(undefined)
    useEffect(() => {
        const m = new KacheryCloudTaskManager({projectId: props.projectId})
        setManager(m)
        return () => {
            m.unsubscribe()
        }
    }, [props.projectId])
    return (
        <KacheryCloudTaskManagerContext.Provider value={manager}>
            {props.children}
        </KacheryCloudTaskManagerContext.Provider>
    )
}

export default KacheryCloudTaskManagerSetup
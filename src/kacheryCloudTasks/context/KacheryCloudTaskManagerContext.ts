import KacheryCloudTaskManager from '../KacheryCloudTaskManager'
import React, { useContext } from 'react'

const KacheryCloudTaskManagerContext = React.createContext<KacheryCloudTaskManager | undefined>(undefined)

export const useKacheryCloudTaskManager = () => {
    return useContext(KacheryCloudTaskManagerContext)
}

export default KacheryCloudTaskManagerContext
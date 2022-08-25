import React from 'react'

const FigurlContext = React.createContext<{
    backendId: (projectId: string) => string | null
    setBackendId: (projectId: string, x: string | null) => void
    localMode: boolean
} | undefined>(undefined)

export default FigurlContext
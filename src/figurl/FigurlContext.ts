import React from 'react'

const FigurlContext = React.createContext<{
    localMode: boolean
} | undefined>(undefined)

export default FigurlContext
import { FunctionComponent, useContext, useMemo } from 'react';
import FigurlContext from './FigurlContext';

type Props = {
    localMode: boolean
}

export const useLocalMode = () => {
    const context = useContext(FigurlContext)
    return context ? context.localMode : false
}

const FigurlSetup: FunctionComponent<Props> = ({children, localMode}) => {
    const value = useMemo(() => ({
        localMode
    }), [localMode])
    return (
        <FigurlContext.Provider value={value}>
            {children}
        </FigurlContext.Provider>
    )
}

export default FigurlSetup
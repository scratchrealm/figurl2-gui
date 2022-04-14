import { useContext } from "react"
import FigurlContext from "./FigurlContext"

const useBackendId = () => {
    const context = useContext(FigurlContext)
    return {
        backendIdForProject: context ? context.backendId : () => (null),
        setBackendIdForProject: context ? context.setBackendId : () => {}
    }
}

export default useBackendId
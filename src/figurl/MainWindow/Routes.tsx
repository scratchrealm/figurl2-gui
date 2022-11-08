import Figure2, { useRoute2 } from 'figurl/Figure2/Figure2'
import FigureInterface from 'figurl/Figure2/FigureInterface'
import { useLocalMode } from 'figurl/FigurlSetup'
import React, { FunctionComponent } from 'react'
import HomePage, { HomePageProps } from '../HomePage/HomePage'
import GitHubAuthPage from './GitHub/GitHubAuthPage'
import VerifyLocalKacheryDir from './VerifyLocalKacheryDir'

type Props = {
    width: number
    height: number
    homePageProps: HomePageProps
    setFigureInterface: (x: FigureInterface) => void
}

const Routes: FunctionComponent<Props> = ({width, height, homePageProps, setFigureInterface}) => {
    const {routePath, label} = useRoute2()
    const localMode = useLocalMode()

    if (routePath === '/about') {
        return <div>About</div>
    }
    else if (routePath === '/f') {
        document.title = label
        const figure2 = (
            <Figure2
                width={width}
                height={height}
                setFigureInterface={setFigureInterface}
            />
        )
        return (
            localMode ? (
                <VerifyLocalKacheryDir>
                    {figure2}
                </VerifyLocalKacheryDir>
            ) : figure2
        )
    }
    else if (routePath === '/github/auth') {
        document.title = 'figurl github auth'
        return <GitHubAuthPage />
    }
    else {
        document.title = 'figurl'
        return <HomePage {...homePageProps} />
    }
}

export default Routes
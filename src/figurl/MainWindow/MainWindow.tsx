import { useRoute2 } from 'figurl/Figure2/Figure2'
import FigureInterface from 'figurl/Figure2/FigureInterface'
import { useGithubAuth } from 'GithubAuth/useGithubAuth'
import React, { useCallback, useEffect, useState } from 'react'
import { HomePageProps } from '../HomePage/HomePage'
import ApplicationBar from './ApplicationBar/ApplicationBar'
import Routes from './Routes'
import useWindowDimensions from './useWindowDimensions'

type Props = {
    logo?: any
    homePageProps: HomePageProps
    hide: number
}

const MainWindow: React.FunctionComponent<Props> = ({logo, homePageProps, hide}) => {
    const {setRoute, label: figureLabel, routePath} = useRoute2()
    const {width, height} = useWindowDimensions()
    const [figureInterface, setFigureInterface] = useState<FigureInterface | undefined>()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    const applicationBarHeight = ((hide === 0) && (height >= 400)) ? 50 : 0
    const {userId, accessToken} = useGithubAuth()
    useEffect(() => {
        if (!figureInterface) return
        figureInterface.setGithubAuth(userId, accessToken)
    }, [userId, accessToken, figureInterface])

    return (
        <div>
            {
                routePath !== '/github/auth' && applicationBarHeight > 0 &&
                <ApplicationBar
                    title={figureLabel || ''}
                    onHome={handleHome}
                    logo={logo}
                    height={applicationBarHeight}
                    figureInterface={figureInterface}
                />
            }
            <div>
                <Routes
                    width={width}
                    height={height - applicationBarHeight}
                    homePageProps={{...homePageProps}}
                    setFigureInterface={setFigureInterface}
                />
            </div>
        </div>
    )
}

export default MainWindow
import { useRoute2 } from 'figurl/Figure2/Figure2'
import FigureInterface from 'figurl/Figure2/FigureInterface'
import { useGithubAuth } from 'GithubAuth/useGithubAuth'
import KacheryCloudTaskManagerSetup from 'kacheryCloudTasks/context/KacheryCloudTaskManagerSetup'
import React, { useCallback, useEffect, useState } from 'react'
import { HomePageProps } from '../HomePage/HomePage'
import ApplicationBar from './ApplicationBar/ApplicationBar'
import Routes from './Routes'
import useWindowDimensions from './useWindowDimensions'

type Props = {
    packageName: string
    logo?: any
    homePageProps: HomePageProps
    hide: number
}

const MainWindow: React.FunctionComponent<Props> = ({packageName, logo, homePageProps, hide}) => {
    const {setRoute, label: figureLabel, projectId, backendId, routePath} = useRoute2()
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
            <KacheryCloudTaskManagerSetup projectId={projectId || ''} backendId={backendId}>
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
            </KacheryCloudTaskManagerSetup>
        </div>
    )
}

export default MainWindow
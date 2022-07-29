import { useRoute2 } from 'figurl/Figure2/Figure2'
import KacheryCloudTaskManagerSetup from 'kacheryCloudTasks/context/KacheryCloudTaskManagerSetup'
import React, { useCallback } from 'react'
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
    const {setRoute, label: figureLabel, projectId} = useRoute2()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    const applicationBarHeight = hide === 0 ? 50 : 0

    return (
        <div>
            <KacheryCloudTaskManagerSetup projectId={projectId || ''}>
                <ApplicationBar
                    title={figureLabel || ''}
                    onHome={handleHome}
                    logo={logo}
                    height={applicationBarHeight}
                />
                <div>
                    <Routes
                        width={width}
                        height={height - applicationBarHeight}
                        homePageProps={{...homePageProps}}
                    />
                </div>
            </KacheryCloudTaskManagerSetup>
        </div>
    )
}

export default MainWindow
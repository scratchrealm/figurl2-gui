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
}

const MainWindow: React.FunctionComponent<Props> = ({packageName, logo, homePageProps}) => {
    const {setRoute, label: figureLabel, projectId} = useRoute2()
    const {width, height} = useWindowDimensions()

    const handleHome = useCallback(() => {
        setRoute({routePath: '/home'})
    }, [setRoute])

    return (
        <div>
            <KacheryCloudTaskManagerSetup projectId={projectId || ''}>
                <ApplicationBar
                    title={figureLabel || ''}
                    onHome={handleHome}
                    logo={logo}
                />
                <div>
                    <Routes
                        width={width - 5}
                        height={height - 50}
                        homePageProps={{...homePageProps}}
                    />
                </div>
            </KacheryCloudTaskManagerSetup>
        </div>
    )
}

export default MainWindow
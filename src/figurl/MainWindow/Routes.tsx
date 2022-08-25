import Figure2, { useRoute2 } from 'figurl/Figure2/Figure2'
import { useLocalMode } from 'figurl/FigurlSetup'
import React, { FunctionComponent } from 'react'
import HomePage, { HomePageProps } from '../HomePage/HomePage'
import VerifyLocalKacheryDir from './VerifyLocalKacheryDir'

type Props = {
    width: number
    height: number
    homePageProps: HomePageProps
}

const Routes: FunctionComponent<Props> = (props) => {
    const {width, height, homePageProps} = props
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
    else {
        document.title = 'figurl'
        return <HomePage {...homePageProps} />
    }
}

export default Routes
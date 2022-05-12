import Figure2, { useRoute2 } from 'figurl/Figure2/Figure2'
import React, { FunctionComponent } from 'react'
import HomePage, { HomePageProps } from '../HomePage/HomePage'

type Props = {
    width: number
    height: number
    homePageProps: HomePageProps
}

const Routes: FunctionComponent<Props> = (props) => {
    const {width, height, homePageProps} = props
    const {routePath, label} = useRoute2()

    if (routePath === '/about') {
        return <div>About</div>
    }
    else if (routePath === '/f') {
        document.title = label
        return (
            <Figure2
                width={width}
                height={height}
            />
        )
    }
    else {
        document.title = 'figurl'
        return <HomePage {...homePageProps} />
    }
}

export default Routes
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn'
import React, { FunctionComponent } from 'react'
import './Home.css'
import IntroSection from './IntroSection'
import './localStyles.css'
import SavedFiguresTable from './SavedFiguresTable'

export type HomePageProps = {
    packageName: string
    pythonProjectVersion: string
    webAppProjectVersion: string
    repoUrl: string
}

const HomePage: FunctionComponent<HomePageProps> = ({packageName, pythonProjectVersion, webAppProjectVersion, repoUrl}) => {
    const {signedIn} = useSignedIn()

    return (
        <div style={{margin: 'auto', maxWidth: 1200, paddingLeft: 10, paddingRight: 10}}>
            
            <IntroSection />

            {
                signedIn ? (
                    <SavedFiguresTable />
                ) : (
                    <h3>Sign in to see your saved figures</h3>
                )
            }


            <span>
                <hr />
                <p style={{fontFamily: 'courier', color: 'gray'}}>Figurl web application version: {webAppProjectVersion}</p>
            </span>
        </div>
    )
}

export default HomePage
import { useGithubAuth } from 'GithubAuth/useGithubAuth'
import { FunctionComponent } from 'react'
import './Home.css'
import IntroSection from './IntroSection'
import './localStyles.css'
import SavedFiguresTable from './SavedFiguresTable'

export type HomePageProps = {
}

const HomePage: FunctionComponent<HomePageProps> = () => {
    const {signedIn} = useGithubAuth()

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
            </span>
        </div>
    )
}

export default HomePage
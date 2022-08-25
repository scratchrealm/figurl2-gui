import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'commonInterface/crypto/signatures';
import GoogleSignInSetup from 'components/googleSignIn/GoogleSignInSetup';
import React, { FunctionComponent, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import FigurlSetup from './FigurlSetup';
import './index.css';
import MainWindow from './MainWindow/MainWindow';
// import logo from './logo.svg';
import theme from './theme';

testSignatures()

type Props = {
  packageName: string
  pythonProjectVersion: string
  webAppProjectVersion: string
  repoUrl: string
  logo: any
  hide: number
  localMode: boolean
}

const FigurlApp: FunctionComponent<Props> = ({
  packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, logo, hide, localMode
}) => {
  const homePageProps = useMemo(() => ({
    packageName, pythonProjectVersion, webAppProjectVersion, repoUrl
  }), [packageName, pythonProjectVersion, webAppProjectVersion, repoUrl])
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <FigurlSetup localMode={localMode}>
              <MainWindow
                packageName={packageName}
                logo={logo}
                homePageProps={homePageProps}
                hide={hide}
              />
            </FigurlSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default FigurlApp

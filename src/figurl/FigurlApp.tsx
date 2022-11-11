import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'commonInterface/crypto/signatures';
import GoogleSignInSetup from 'components/googleSignIn/GoogleSignInSetup';
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import FigurlSetup from './FigurlSetup';
import './index.css';
import MainWindow from './MainWindow/MainWindow';
import useWindowDimensions from './MainWindow/useWindowDimensions';
// import logo from './logo.svg';
import theme from './theme';

testSignatures()

type Props = {
  packageName: string
  pythonProjectVersion: string
  webAppProjectVersion: string
  logo: any
  hide: number
  localMode: boolean
}

const useIsMobile = () => {
  /*
    I tried using react-device-detect to do this, but it didn't work for safari and chrome on iphone,
    so it's better to do it using screen size. It seems the smallest tablet is 768 pixels.
  */
  const {width} = useWindowDimensions()
  const effectiveWidth = useRef(0) // the maximum width we ever experienced (handles case where user resizes window to smaller)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (width > effectiveWidth.current) {
      effectiveWidth.current = width
    }
    if (effectiveWidth.current) {
      setIsMobile(effectiveWidth.current < 768)
    }
  }, [width])
  return {isMobile}
}

const FigurlApp: FunctionComponent<Props> = ({
  packageName, pythonProjectVersion, webAppProjectVersion, logo, hide, localMode
}) => {
  const homePageProps = useMemo(() => ({
    packageName, pythonProjectVersion, webAppProjectVersion
  }), [packageName, pythonProjectVersion, webAppProjectVersion])
  const {isMobile} = useIsMobile()
  if ((isMobile) && (window.location.pathname !== '/') && (window.location.pathname !== '/home')) {
    /*
    I tried using react-device-detect to do this, but it didn't work for safari and chrome on iphone,
    so it's better to do it using screen size. It seems the smallest tablet is 768 pixels.
    */
    return (
      <div style={{padding: 20}}>
          This website cannot be viewed on a mobile device. Please open this link on a computer or enable the "Desktop" mode in your browser.
      </div>
    )
  }
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

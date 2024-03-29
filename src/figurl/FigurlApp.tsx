import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'commonInterface/crypto/signatures';
import Hyperlink from 'components/Hyperlink/Hyperlink';
import GithubAuthSetup from 'GithubAuth/GithubAuthSetup';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import FigurlSetup from './FigurlSetup';
import './index.css';
import MainWindow from './MainWindow/MainWindow';
import useWindowDimensions from './MainWindow/useWindowDimensions';
// import logo from './logo.svg';
import theme from './theme';
import { BrowserRouter } from 'react-router-dom';

testSignatures()

type Props = {
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
      setIsMobile(effectiveWidth.current <= 600)
    }
  }, [width])
  return {isMobile}
}

const FigurlApp: FunctionComponent<Props> = ({
  logo, hide, localMode
}) => {
  const {width, height} = useWindowDimensions()
  const homePageProps = useMemo(() => ({
  }), [])
  const {isMobile} = useIsMobile()
  const [viewAnyway, setViewAnyway] = useState(false)
  if ((!viewAnyway) && (isMobile) && (window.location.pathname !== '/') && (window.location.pathname !== '/home')) {
    /*
    I tried using react-device-detect to do this, but it didn't work for safari and chrome on iphone,
    so it's better to do it using screen size. It seems the smallest tablet is 768 pixels.
    */
    return (
      <div style={{padding: 20}}>
        <p>
          This website is not designed to be viewed in mobile device mode. Please open this link on a computer or enable the "Desktop" mode in your browser.
          If the page still does not load, try using your device in landscape orientation.
        </p>
        <p>
          There are known issues with Firefox on mobile, so we recommend either Chrome or Safari.
        </p>
        <p>
          <Hyperlink onClick={() => setViewAnyway(true)}>view page anyway</Hyperlink>
        </p>
        <p>
          <a href="https://figurl.org">Figurl home</a>
        </p>
        <p style={{fontSize: 12, color: 'gray'}}>
          Window dimensions: {width} x {height}
        </p>
      </div>
    )
  }
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GithubAuthSetup>
            <FigurlSetup localMode={localMode}>
              <MainWindow
                logo={logo}
                homePageProps={homePageProps}
                hide={hide}
              />
            </FigurlSetup>
          </GithubAuthSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default FigurlApp

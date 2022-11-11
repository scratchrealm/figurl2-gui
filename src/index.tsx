import FigurlApp from 'figurl/FigurlApp';
import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import packageName from './packageName';
import reportWebVitals from './reportWebVitals';
import { pythonProjectVersion, webAppProjectVersion } from './version';
import {isMobile} from 'react-device-detect';

// async function test1() {
//   const resp = await axios.get(`http://localhost:20431/probe`, {responseType: 'text'})
//   const content = resp.data
//   console.log('Test connect to local daemon', content)
// }
// test1()

/*
Detect whether we have an old-style link and then redirect to v1.figurl.org
*/
const channel = getQueryVariable('channel')
if (channel) {
  (window as any).location = `https://v1.figurl.org${window.location.pathname}?${window.location.search.substring(1)}`
}

const hideStr = getQueryVariable('hide') || '0'
const hide = parseInt(hideStr)

const localStr = getQueryVariable('local') || '0'
const local = parseInt(localStr)


if (isMobile) {
  ReactDOM.render(
    (
      <span>
        This website cannot be viewed on a mobile device. Please open this link on a computer.
      </span>
    ),
    document.getElementById('root')
  )
}
else {
  ReactDOM.render(
    // disable strict mode to supress: "findDOMNode is deprecated in StrictMode" warnings
    (
    // <React.StrictMode>
      <FigurlApp
        packageName={packageName}
        pythonProjectVersion={pythonProjectVersion}
        webAppProjectVersion={webAppProjectVersion}
        repoUrl={"https://github.com/scratchrealm/figurl2"}
        logo={logo}
        hide={hide}
        localMode={local ? true : false}
      />
      // </React.StrictMode>
    ),
    document.getElementById('root')
  )
}

function getQueryVariable(variable: string) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=')
      if (decodeURIComponent(pair[0]) === variable) {
          return decodeURIComponent(pair[1])
      }
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

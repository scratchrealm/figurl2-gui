import { UserId } from 'commonInterface/kacheryTypes'
import React from 'react'

export type GoogleSignInData = {
    signedIn: boolean
    userId?: UserId,
    googleIdToken?: string
    gapi?: any
    client?: any
}

const dummyGoogleSignInData: GoogleSignInData = {signedIn: false}

const GoogleSignInContext = React.createContext<GoogleSignInData>(dummyGoogleSignInData)

export default GoogleSignInContext
import { isEqualTo, isNumber, isString, _validateObject } from "../commonInterface/kacheryTypes"

export type TimingRequest = {
    type: 'timing'
}

export const isTimingRequest = (x: any): x is TimingRequest => (
    _validateObject(x, {
        type: isEqualTo('timing')
    })
)

export type TimingResponse = {
    type: 'timing',
    elapsedTimesMsec: {
        putFilebaseObject: number,
        getFilebaseSignedUploadUrl: number,
        putFilebaseObjectUsingUploadUrl: number,
        getFilebaseObject: number,
        getFilebaseObjectViaHttp: number,
        deleteFilebaseObject: number,
        downloadFromIPFSGateway: number,
        downloadFromIPFSGatewayAfterDelay: number
    },
    misc: {
        deletedCIDExample: string
    }
}

export const isTimingResponse = (x: any): x is TimingResponse => (
    _validateObject(x, {
        type: isEqualTo('timing'),
        elapsedTimesMsec: (y: any) => (
            _validateObject(y, {
                putFilebaseObject: isNumber,
                getFilebaseSignedUploadUrl: isNumber,
                putFilebaseObjectUsingUploadUrl: isNumber,
                getFilebaseObject: isNumber,
                getFilebaseObjectViaHttp: isNumber,
                deleteFilebaseObject: isNumber,
                downloadFromIPFSGateway: isNumber,
                downloadFromIPFSGatewayAfterDelay: isNumber
            })
        ),
        misc: (y: any) => (
            _validateObject(y, {
                deletedCIDExample: isString
            })
        )
    })
)
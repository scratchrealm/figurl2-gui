const sleepMsec = async (msec: number, continueFunction: (() => boolean) | undefined = undefined): Promise<void> => {
    const m = msec
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, m)
    })
}

export default sleepMsec
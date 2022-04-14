import { AddFigureRequest, AddFigureResponse, Figure } from "../src/miscTypes/FigureRequest";
import firestoreDatabase from "./common/firestoreDatabase";
import { VerifiedReCaptchaInfo } from "./common/verifyReCaptcha";

const addFigureHandler = async (request: AddFigureRequest, verifiedUserId: string, verifiedReCaptchaInfo: VerifiedReCaptchaInfo): Promise<AddFigureResponse> => {
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }
    const figure: Figure = request.figure
    if (figure.ownerId !== verifiedUserId) {
        throw Error(`Not authorized to add figure: ${figure.ownerId} <> ${verifiedUserId}`)
    }
    figure.figureId = randomAlphaString(12)
    figure.creationDate = Date.now()
    const db = firestoreDatabase()
    const collection = db.collection('figurl.figures')
    const docRef = collection.doc(figure.figureId)
    await docRef.set(figure)

    return {
        type: 'addFigure',
        figureId: figure.figureId
    }
}

export const randomAlphaString = (num_chars: number) => {
    if (!num_chars) {
        /* istanbul ignore next */
        throw Error('randomAlphaString: num_chars needs to be a positive integer.')
    }
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default addFigureHandler
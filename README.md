<img src="./figurl.png" width="200px" />

# figurl2-gui

This is the front-end/web app for [figurl2](https://github.com/scratchrealm/figurl2). It uses the following:

* [Typescript](https://www.typescriptlang.org/)
* [ReactJS](https://reactjs.org/) and [create-react-app](https://create-react-app.dev/)
* [Vercel](https://vercel.com)
* [Google Cloud Firestore](https://firebase.google.com/docs/firestore)
* [Kachery-cloud](https://github.com/scratchrealm/kachery-cloud)

## Local development

Requires a recent version of [npm](https://www.npmjs.com/) and [yarn](https://www.npmjs.com/package/yarn).

```
yarn install
vercel dev
```

The project must be registered on vercel and certain environment variables must be set for the vercel project (not yet documented). See [vercel.com](https://vercel.com)

## Deployment

```
vercel --prod
```

## Authors

Jeremy Magland and Jeff Soules, [Center for Computational Mathematics, Flatiron Institute](https://www.simonsfoundation.org/flatiron/center-for-computational-mathematics)

## License

Apache 2.0

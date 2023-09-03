# ZTHost

ZTHost (it's supposed to mean "Zero Trust Host") is a cloud storage platform built on top of Google Firebase and existing storage providers, such as Google Drive. It encrypts data in the browser before uploading to the server and will transparently decrypt it before downloading. The aim is to provide better privacy for your data without incurring extra monetary and/or time cost from self-hosting things. There is no backend and it can be deployed as a static website, which is available free-of-charge on many hosting providers.

## Installation

Recommended node version: v18.17.0

```sh
git clone git@github.com:dchenz/zthost.git
cd zthost

# Install required dependencies
yarn install

# Start developing locally
yarn start

# Build for production
yarn build
```

## Firebase setup

1. Create a new Firebase project (Google Analytics can be skipped).
2. Under the section to add Firebase to an application, select "Web".
3. Enter a name for your application, then click "Register app".
4. Copy the Firebase configuration into a `.env` file (see below).
5. Go to "Authentication" from the sidebar and enable Google sign-in under "Additional providers".
6. Go to "Firestore Database" from the sidebar and create a new database.
7. Change to the database's "Rules" tab and copy the contents of `.rules`, which is in the repository root directory.
8. [Enable the Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) for your Firebase project in the GCP console.
9. If you're going to be deploying this, make sure you've whitelisted the domain in the Firebase project settings.

## Environment variables

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

Separate Firebase projects can be used for development and production, so your real data doesn't get corrupted. Simply use `.env.production.local` and `.env.development.local`, which React will automatically load based on `process.env.NODE_ENV`.

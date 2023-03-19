# App

This is the mobile app. This is built using [React Native](https://reactnative.dev/) and [Expo](https://docs.expo.dev/).

## Run

First ensure that the [backend](../backend/README.md) is properly setup, then proceed:

```bash
yarn dev:app
```

Then scan the QR code with the [Expo Go](https://docs.expo.dev/get-started/installation/#expo-go-app-for-android-and-ios) app.

## Build APK

To build APK, you will need a few things (Assuming you're using Ubuntu 20):

1. Generate `keystore` file. You have to perform this step only the first time.
   1. Install OpenJDK: `apt-get update && apt-get install default-jre`.
   2. Verify it is installed: `java --version`.
   3. Follow these instructions: [Click here](https://docs.expo.dev/app-signing/local-credentials/#android-credentials)
   4. You should now have a `apps/app/android/keysotres/release.keystore` and a `apps/app/credentials.json` file.
2. Generate Expo Login token. You have to perform this step only the first time.
   1. Follow these instructions: [Link](https://docs.expo.dev/accounts/programmatic-access/)
   2. Once the token is generated, copy it somewhere.
3. Go to the root directory of this project.
4. Run `docker build . -f ./Dockerfile.appbuild --build-arg expo_auth_token=$EXPO_TOKEN -t schooltalk-app-builder`. Replace `$EXPO_TOKEN` with the token obtained from step #2. Wait for the command to finish. It may take several minutes.
   - You can additionally pass the build arg `profile`. Defaults to `preview`.
5. Then run a container using `docker run -d --name app-builder schooltalk-app-builder`.
6. You can monitor the logs using `docker logs app-builder -f -n 100`.
7. Once build finishes, note down the path of the generated APK file from the previous command's output.
8. Then extract the APK file using [this method](https://stackoverflow.com/a/31316636/9990365). Put the appropriate image name, which is `schooltalk-app-builder`.

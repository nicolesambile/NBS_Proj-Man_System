# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Delivery API

The delivery screen uses the PHP API contract in `services/api.ts`. Configure the reachable API URL before starting the app:

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to your API URL. On a physical phone, use the computer's LAN IP address; `localhost` refers to the phone itself.
3. Keep `EXPO_PUBLIC_ALLOW_INSECURE_HTTP=true` only for local Android development against an HTTP server. Use HTTPS for iOS and production, then remove this setting.
4. Restart Expo after changing `.env`. For a generated Android app, run `npx expo prebuild --platform android` and rebuild to apply the development HTTP setting.

The API must return JSON using `{ "success": true, "data": ... }`. A list response must provide an array in `data`; create, update, and delete requests must accept JSON bodies using `POST`, `PUT`, and `DELETE`.

Browser-based Expo Web also requires CORS. The PHP API allows the common local Expo origins; if you use a different host or port, add the exact app origin to `$defaultAllowedOrigins` in the API file or set `TRUCK_API_ALLOWED_ORIGINS` in Apache.

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# Echo

Turning darkness into light. 

Made with the React Native + Expo starter kit: [MakerKit](https://makerkit.dev)

# Prerequisites

- Node.js
- pnpm
- gcloud: `brew install google-cloud-sdk`


# Cloud Functions

The GCP cloud functions are located in the `apps/cloud-functions` directory.

To deploy one, go to that folder and run `gcloud functions deploy {function name} --runtime nodejs20 --trigger-http --allow-unauthenticated`.

# Deploy

I am using (EAS)[https://docs.expo.dev/eas/hosting/get-started/]. First `cd` into `apps/expo-app`. To compile the web version, run `npx expo export --platform web`. To deploy, run `npx eas-cli deploy`.

## What's Included

### Core Architecture

- 🏗️ Expo + React Native
- 🎨 NativeWind + Tailwind CSS +
  [React Native Reusable Components](https://rnr-docs.vercel.app/getting-started/introduction/)
- 🔐 Supabase authentication & basic DB
- ✨ Full TypeScript + ESLint + Prettier configuration

### Installation

1. Clone the repository

```bash
git clone https://github.com/makerkit/expo-turbo-saas-kit.git <your-project-name>
```

2. Install dependencies

```bash
cd <your-project-name>
pnpm install
```

3. Create .env file

Using the .env.template file as a template, create a .env file in the `apps/expo-app` directory

First:
```bash
cd apps/expo-app
```

Second:
```bash
cp .env.template .env
```

Replace the `EXPO_PUBLIC_SUPABASE_API_URL` with a proxy if you are testing using a device connected to your computer.

4. Start the development server

```bash
pnpm dev
```
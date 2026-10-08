# MyHealth

A mobile fitness tracker built with React Native and Firebase. It counts your steps in real time, estimates distance and calories, and lets you set daily goals and review your weekly progress.

Final-year project (PFE).

## Demo

[Watch the app demo](docs/demo.mp4)

## Features

- **Authentication**: email/password sign-up and login, with the session persisted between launches
- **Live step tracking**: step counting through the device pedometer, with derived distance (km) and calories (kcal)
- **Daily goals**: set a target for steps, calories and distance, and follow overall completion on a progress ring
- **Weekly history**: bar chart of steps per day with week-by-week navigation
- **Profile**: edit personal information and change your password
- **Offline-friendly sync**: steps are stored locally and pushed to Firestore in batches

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | React Native 0.79, Expo SDK 53, TypeScript |
| Navigation | Expo Router (file-based routing) |
| Backend | Firebase Authentication, Cloud Firestore |
| Sensors | `expo-sensors` (Pedometer) |
| Animations and charts | Reanimated, React Native SVG, react-native-chart-kit |
| Local storage | AsyncStorage |

## Getting started

Prerequisites: Node.js 18+, and a Firebase project.

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure Firebase

   - In the Firebase console, enable **Authentication → Email/Password** and create a **Firestore** database.
   - Publish the rules from [`firestore.rules`](firestore.rules).
   - Copy the example environment file and fill in your web app settings:

   ```bash
   cp .env.example .env
   ```

3. Start the app

   ```bash
   npx expo start
   ```

   Open it with Expo Go, or build a development client with `npx expo run:android` / `npx expo run:ios`. Step counting requires a physical device.

Useful scripts: `npm run typecheck`, `npm run lint`.

## Project structure

```
app/
  (auth)/          login and sign-up screens
  (tabs)/          dashboard, history and goals tabs
  goal/[type].tsx  goal editor (steps, calories or distance)
  profile.tsx      profile screen
components/        GoalCard, ProgressRing
hooks/             useTodayActivity, useStepCounter, useGoals
services/          Firestore access (activity sync, goals)
providers/         AuthProvider
lib/               Firebase setup, theme, metric definitions, date helpers
```

## Data model

```
users/{uid}                      profile (fullName, email, mobileNumber, dateOfBirth)
users/{uid}/activities/{date}    daily totals: steps, calories, distance
users/{uid}/objectives/{type}    daily goal for "steps", "calories" or "distance"
```

### How activity sync works

The displayed total for the day is the Firestore total plus the steps counted on the device that are not synced yet. New steps are saved locally on every update and pushed to Firestore with atomic increments when the batch is older than five minutes, belongs to a previous day, or when the user logs out. This keeps writes low while the dashboard stays live.

## Security

Firebase web configuration is read from environment variables (`.env` is git-ignored). Access control is enforced by Firestore security rules: each user can only read and write their own data.

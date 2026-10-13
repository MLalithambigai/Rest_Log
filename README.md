# RestLog — Sleep & Health Tracker

A clean, offline-first React Native / Expo sleep tracker built for the NextGen Innovations assessment.

---

## Features

### 📋 Log Sleep
- Select **bedtime** and **wake-up time** via a custom tactile time picker (hour / minute / AM-PM)
- Duration is **auto-calculated**, cross-midnight aware (e.g. 11 PM → 7 AM = 8h 0m)
- Toggle between **Tonight / Today** and **Last Night** — perfect for logging after waking up
- Rate sleep quality on a **1–5 scale** with descriptive labels: Restless → Deep Rest
- Add freeform **notes** and select **hygiene tags** (Reading, Cool room, Workout, etc.)
- Success banner with shortcut to view history after saving

### 📖 History
- All past sessions displayed as cards — date, time interval, duration badge, quality score, note & tags
- **Color-coded duration** (green = optimal 7–9h, amber = moderate, red = under 6h)
- Swipe-less **delete with confirmation** dialog per entry
- Empty-state prompt to log or load a 7-day sample dataset

### 📊 Trends & Insights
- **7-day rolling bar chart** with a dashed 8-hour target baseline
- Tap any bar to inspect full detail: bedtime → wake time, quality label, note
- **4 metric cards**: Avg Duration, Avg Sleep Score, Optimal Nights, Weekly Balance (surplus/deficit)
- Dynamic contextual insight text based on your recorded averages

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 57 (blank-typescript template) |
| Language | TypeScript (strict mode) |
| Navigation | Manual tab state in `App.tsx` — no `react-navigation` dependency |
| Persistence | `@react-native-async-storage/async-storage` — data survives full app restarts |
| Icons | Unicode symbols + `@expo/vector-icons` (bundled) |
| Safe Area | `react-native-safe-area-context` |
| Chart | Pure `View` + `StyleSheet` — zero external chart library |

---

## Project Structure

```
Restlog/
├── App.tsx                         # Root: state, SafeAreaProvider, tab router
├── src/
│   ├── types/
│   │   └── sleep.ts                # SleepEntry, DaySleepPoint, WeeklyInsightSummary
│   ├── theme/
│   │   └── index.ts                # Color tokens, spacing, radius
│   ├── utils/
│   │   └── time.ts                 # Duration calc, format helpers, rolling 7-day window
│   ├── services/
│   │   └── storage.ts              # AsyncStorage CRUD + demo seeder
│   ├── components/
│   │   ├── NavBar.tsx              # Bottom dock navigation with badge
│   │   ├── TimePickerModal.tsx     # Custom 12h time picker (hour / min / AM-PM)
│   │   ├── SleepQualityPicker.tsx  # 1–5 rating with descriptors
│   │   ├── DurationDisplay.tsx     # Progress bar vs. 8h target
│   │   ├── WeeklyChart.tsx         # 7-day bar chart with tap-to-inspect
│   │   ├── MetricCard.tsx          # Stat tile component
│   │   └── EmptyState.tsx          # Placeholder for no-data states
│   └── screens/
│       ├── LogSleepScreen.tsx      # Screen 1: Log new sleep session
│       ├── HistoryScreen.tsx       # Screen 2: Past entries + delete
│       └── TrendsScreen.tsx        # Screen 3: Chart + insights + metrics
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Emulator, **OR** the [Expo Go](https://expo.dev/go) app on a physical device

### Install & Run

```bash
# Clone the repo
git clone https://github.com/lalithambigai/Restlog.git
cd Restlog

# Install dependencies
npm install

# Start on iOS Simulator
npx expo start --ios --clear

# Start on Android Emulator
npx expo start --android

# Start on Web (quick preview)
npx expo start --web
```

> **Tip:** Press `i` in the Metro terminal to open iOS simulator, `a` for Android.

---

## Offline Persistence

All sleep sessions are stored locally via **AsyncStorage** under the key `@restlog_entries_v1`.

- Data persists across full app restarts — no network required
- Works on iOS, Android, and Web (localStorage fallback on web)

---

## Evaluation Utilities

On the **Trends** screen, a card at the bottom provides two helper actions for demo purposes:

- **Load 7-Day Sample Dataset** — populates six realistic pre-written entries spanning the past week (varied quality scores, notes, and tags)
- **Clear All Data** — wipes all records to start fresh

These are intentionally left in to make walkthrough demonstrations easier.

---

## Design Decisions

- **Dark-first palette** — deep navy/slate (`#0A0D14`), amber accent (`#F59E0B`), custom font-weight hierarchy for visual hierarchy
- **Custom time picker** — built from scratch using scrollable lists for hour/minute and AM/PM toggle; no native `DateTimePicker` to keep UI consistent across iOS and web
- **Pure View chart** — bar chart uses only `View` + `StyleSheet`; no SVG/canvas dependency
- **Cross-midnight aware** — duration calculation wraps correctly (e.g. 11:30 PM → 7:00 AM = 7h 30m)
- **Night selector** — "Tonight / Today" vs "Last Night" toggle so users can retroactively log the previous night's sleep when logging in the morning
- **Zero navigation library** — tab state managed directly in `App.tsx` for simplicity and smaller bundle

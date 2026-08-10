# Upgrade

A calm, offline-first personal operating system — Routine, Skills, To-Do, and Insights in one unified daily experience.

> Reduce friction, not discipline.

This is a working Expo/React Native + TypeScript scaffold implementing the full V1 architecture described in the product documentation: offline-first SQLite (via Drizzle ORM) for domain data, MMKV for lightweight preferences, Zustand for state, and a feature-first folder structure.

## Pinned versions — please don't `npm update` these

Three dependencies are pinned to exact or narrow versions on purpose, not carelessness — all found by actually running `npm install` end-to-end (including postinstall scripts) rather than assuming a version range would resolve safely:

- **`nativewind` is pinned to exactly `4.1.23`** (no `^`). Anything newer (4.2.x) pulls in a `react-native-css-interop` release that unconditionally requires `react-native-worklets/plugin` — a Reanimated-4-only package. Since this project intentionally uses Reanimated 3.x (matching Expo SDK 51), that newer version will crash the Babel build on literally every file with `Cannot find module 'react-native-worklets/plugin'`. `.npmrc` sets `save-exact=true` so `npm install <pkg>@version` won't silently widen this back into a caret range.
- **`react-native-screens` is pinned to exactly `3.31.1`.** The very next version down, `3.31.0`, has a broken npm publish: it ships a `postinstall: 'bob build && husky install'` script meant only for that library's own contributors, which fails on install for everyone else with `'bob' is not recognized as an internal or external command` (or `command not found` on Mac/Linux). `3.31.1` has no such script. All other native module versions in this file (`expo-*`, `react-native-*`) are pinned to match [Expo SDK 51's officially tested compatibility manifest](https://github.com/expo/expo/blob/sdk-51/packages/expo/bundledNativeModules.json) exactly, for the same reason — don't assume a caret range is safe for React Native native modules; a single patch bump can carry a breaking change or a packaging mistake like this one.
- **`victory-native` was removed entirely** — it was listed as a dependency but never actually imported anywhere (the heatmap/progress ring are hand-built with SVG instead). Its `@shopify/react-native-skia` peer dependency resolves to a React-19-only version, which broke `npm install` outright. If you want real charts later, Expo SDK 51's tested version of `@shopify/react-native-skia` is `1.2.3` (not latest) — check that against whatever charting library you pick.

If you ever do want to move to Reanimated 4 / React 19 (e.g. following a future Expo SDK upgrade), all three of the above would need revisiting together, not independently.

## "Save" did nothing — every create action was silently throwing

Root cause: `generateId()` (used by every single create action — habits, skills, to-dos, completions, sessions) calls the `uuid` package's `v4()` function, which requires `crypto.getRandomValues()`. Hermes (React Native's JS engine) doesn't provide that on the global object by default. Without it, `uuid` throws `crypto.getRandomValues() not supported`, and since nothing in the call chain caught that error, the promise just silently rejected — the sheet stayed open, no error appeared, and it looked exactly like a dead button.

Fixed with `react-native-get-random-values`, the standard polyfill for this exact problem, imported as the very first line of `index.js` (import order matters — it has to patch the global object before anything else, including `uuid` itself, runs). Pinned to `1.11.0` specifically: the latest version (`2.0.0`) requires React Native ≥0.81, another instance of the same "unpinned dependency drifts past this project's RN 0.74 baseline" pattern as everywhere else in this list.

Verified concretely: reproduced the exact error using the same browser build of `uuid` that Metro resolves for React Native, with `global.crypto` deleted to simulate Hermes — confirmed it throws — then confirmed the polyfill package fixes it.

While fixing this, a related gap got closed too: several create flows (`skillsStore.create`, `todoStore.create`) caught their own errors internally but never re-threw, so the calling screen had no way to know a save had failed — it would just close the sheet as if it succeeded. All three creation sheets (Routine's new unified one, Skills, To-Do) now show a real inline error message and a loading state on the Save button if something does go wrong in the future.

## UX changes in this pass

- **Save button is now clearly more prominent** — bold, larger text, full-width in every creation sheet, and a subtle shadow/elevation so it reads as a raised, tappable surface instead of a flat block of color next to the input field.
- **The Routine screen's greeting is now reactive** (`src/hooks/useGreeting.ts`) — recomputes on screen focus and every 60 seconds, so it can't get stuck showing a stale value no matter how long the screen has been open. The underlying morning/afternoon/evening logic (`greetingForTime` in `src/utils/date.ts`) was already correct; this closes the gap where it was only ever as fresh as the last unrelated re-render.
- **The "+" button now opens a single unified "Add Item" sheet** (`src/components/AddItemSheet.tsx`) instead of only creating habits: title + a Habit/Skill/To-Do category picker, defaulting to To-Do. Each category respects its own existing rules — a new skill starts inactive and won't appear in Routine until activated from the Skills tab (with an inline hint saying so up front), while a new habit or to-do appears immediately. Skills and To-Do each keep their own screen's simpler single-purpose "+" (no category picker needed there, since the category is already implied by which screen you're on).

## "We could not open your data" on first real launch — a migration bug, not a build bug

This one got past every previous check (`tsc`, full Babel transform, a real Metro bundle export) because none of those actually *execute* a database migration — the app installed and opened fine, and only failed the moment it tried to run `runMigrations()` for real on a device.

Root cause: `drizzle-orm`'s expo-sqlite migrator splits each migration's SQL on the literal marker `--> statement-breakpoint` to get individual executable statements — `drizzle-kit generate` inserts that marker automatically between every statement it generates. These migrations were hand-written (not generated), and the marker was missing entirely from `0000_initial.sql`, which has 10 separate `CREATE TABLE`/`CREATE INDEX` statements. Without the marker, the migrator tried to run the whole file as one statement, which SQLite rejects — exactly the kind of failure that only shows up at real runtime.

Fixed by adding `--> statement-breakpoint` between every statement in that file (single-statement migrations like `0001` and `0002` didn't need it). While fixing it, a second, sneakier version of the same bug turned up: an earlier draft's *explanatory comment* about the marker spelled it out literally, and the naive string-split matched inside that comment too, corrupting the migration around it. Lesson applied: the `.sql` files now contain zero prose, and the explanation lives in `src/database/migrate.ts` instead, in a comment the migrator never parses.

This was checked as thoroughly as this kind of bug can be checked without a device: reproduced drizzle's exact `readMigrationFiles` splitting logic against the real compiled migration bundle, then actually executed every resulting statement against a real SQLite engine (Node's built-in `node:sqlite`), then ran real `INSERT`/`SELECT` queries against every table and confirmed the unique constraint from migration `0002` actually rejects a duplicate.

## The widget library needed an exact, older pin too

`react-native-android-widget` was pinned with a caret (`^0.16.0`), which — same mistake as everywhere else in this list — let it drift. Versions `0.15.1` and newer rewrote their native Android widget-rendering code (`BaseWidget.java`) to use React Native's Fabric/New-Architecture styling classes (`CSSBackgroundDrawable`, `LengthPercentage`, `BorderRadiusProp`, all in `com.facebook.react.uimanager.*`) — classes that don't exist in RN 0.74 (this project's Expo SDK 51 baseline; they were added later, once Expo SDK 52 made the New Architecture the default). The EAS build's Java compiler failed with `cannot find symbol` for each of them.

Fixed by pinning to exactly `0.14.2` — the last version whose native code uses the older, universally-compatible `com.facebook.react.views.view.ReactViewBackgroundDrawable` API instead. Verified directly: downloaded and diffed `BaseWidget.java` across versions to confirm exactly where the API switch happened, then confirmed `0.14.2`'s JS-side API (`FlexWidget`, `TextWidget`, `requestWidgetUpdate`, the config-plugin's `app.json` schema) is unchanged from what the widget code in this project already targets — no other code changes were needed, just the version pin.

## A missing dependency that broke both Expo Go *and* the EAS build

`expo-router` declares `expo-constants` and `expo-linking` as **peer** dependencies (meaning: "the app using me must provide these," not "I'll install them for you"). They were never added to this project's `package.json`, so npm was free to resolve them to whatever the newest published version happened to be — which, months after this project's Expo SDK 51 baseline, meant a version built for a much newer Expo Modules Gradle plugin architecture. Two different symptoms, one root cause:
- In Expo Go: `Cannot find native module 'ExpoLinking'` — Expo Go's bundled native runtime didn't have a matching `ExpoLinking` module.
- In an EAS build: `Plugin [id: 'expo-module-gradle-plugin'] was not found` — the drifted `expo-constants` version's `build.gradle` used a newer Gradle plugin syntax this SDK 51 toolchain doesn't know how to apply.

Fixed by pinning both to the exact versions in [Expo SDK 51's compatibility manifest](https://github.com/expo/expo/blob/sdk-51/packages/expo/bundledNativeModules.json): `expo-constants@~16.0.2`, `expo-linking@~6.3.1`. Verified by checking the installed `expo-constants/android/build.gradle` reverted to the old, compatible `apply from: ...` syntax, and by re-running `expo-doctor`'s exact peer-dependency check.

## Two config gaps that would have blocked `expo start` entirely

Both found by actually running the dev server end-to-end, not by inspection:

- **`app.json` no longer declares `expo-sqlite` as a plugin.** It was only there for the `enableFTS` option (full-text search), which this app never uses. Declaring it made Expo's config resolver `require('expo-sqlite')` on every `expo start`/`expo prebuild`, and under Node 22's stricter module-type detection, that crashes with `Cannot find module '.../expo-sqlite/build/SQLiteDatabase'` — a real packaging quirk in `expo-sqlite` itself (its compiled output uses extension-less ESM-style imports internally, which only resolve correctly through Metro's own bundler, not Node's native `require`/`import`). If you ever do need FTS, re-add the plugin and expect to need a Node LTS version with this specific detection behavior disabled, or an expo-sqlite version that's fixed this.
- **`metro.config.js` didn't exist at all before this fix.** Two things silently depended on it: Drizzle's migrations import raw `.sql` files, which Metro won't resolve without `resolver.sourceExts.push('sql')` (paired with the `babel-plugin-inline-import` plugin in `babel.config.js`, which is what actually inlines the file's contents); and NativeWind v4's Tailwind processing needs its `withNativeWind()` wrapper around the Metro config to turn `global.css` + className props into real styles — without it, nothing would have crashed, but every screen would have rendered completely unstyled.

Both are now verified with a real `npx expo export --platform android`, which successfully bundled all 3253 modules with zero errors — not just `tsc`/Babel checks, an actual Metro bundle.

## Getting Started

```bash
npm install
npx expo start
```

Press `a` for Android or `i` for iOS. This app is Android-first but runs on both.

## What's implemented

- **Routine** — unified daily checklist combining habits, active skills, and pending to-dos, with an animated progress ring, one-tap completion, a completed-items divider, and long-press drag-and-drop reordering.
- **Skills** — full state machine (inactive → active → completed, or archived), practice session logging, drag-and-drop reordering of active skills.
- **To-Do** — persistent tasks that survive daily reset; completion auto-archives; drag-and-drop reordering (backed by the existing `priority` column).
- **Insights** — derived, read-only analytics (no streaks/gamification): a 90-day heatmap, summary stats, and a **Tracker Grid** (see below).
- **Tracker Grid** (`app/tracker.tsx`) — a paper-habit-tracker-style screen: habits/skills as rows, days as columns, "×" for a completed day and a blank box for a skipped one, exactly like a physical tracker sheet. Switch between Month / Quarter / Year, step through periods with the arrows, and pinch-to-zoom + drag-to-pan the grid (double-tap to reset). Reachable from a card on the Insights screen.
- **Archive screens** — dedicated, restorable archive views for Habits, Skills, and To-Dos (`app/archive/*`), reachable via the archive icon in each module's header.
- **Android home-screen widget** — shows today's progress and the next few items, with quick-complete taps on habits/to-dos, built with `react-native-android-widget` (see "Widget" section below).
- **Settings** — accessed from the top-right corner (not the tab bar), currently exposes Reduce Motion.
- **Onboarding** — first-launch flow that creates the user's first habit.

## Drag-and-drop ordering — a schema note

`docs/04-Architecture/04-Database-Schema.md` only defines a `position` column on `routines`. To support reordering Skills the same way, this scaffold adds a `position` column to `skills` (migration `0001_skill_position.sql`); To-Dos reuse the existing `priority` column as their order key — no new column needed there.

There is intentionally **no unified cross-type order table**. Reordering persists correctly *within* each type (drag a habit above another habit, a skill above another skill, etc.), but the Routine screen always renders in a fixed block order — habits, then active skills, then to-dos — so dragging a skill above a habit will "snap back" to its block after the next reload. Adding true cross-type ordering would mean introducing a new `routine_order` table not described in the docs; flagging this trade-off rather than guessing at an undocumented schema change.

## Widget

Built with [`react-native-android-widget`](https://github.com/sAleksovski/react-native-android-widget), which lets the widget UI be written as RN-like components (`src/widgets/RoutineWidget.tsx`) instead of native Kotlin/XML.

- `widget-task-handler.tsx` (project root) — the headless JS handler Android invokes on add/update/resize/click. Registered in `index.js` via `registerWidgetTaskHandler`.
- `src/widgets/widgetData.ts` — reads directly from the service layer (local SQLite only, per the offline-first widget requirement).
- `src/widgets/refreshWidget.tsx` — called from `routineStore`, `skillsStore`, `todoStore`, and the root layout after any mutation that changes today's routine, so the widget stays in sync without polling.
- Widget config (size, label, refresh interval) lives in `app.json` under the `react-native-android-widget` plugin entry.

**Important:** this cannot be tested in Expo Go — it's a native module. You'll need `npx expo prebuild` (or an EAS build) to generate the Android project and run it on a device/emulator. The exact plugin config field names may need small adjustments depending on the installed package version; the structure here follows the library's documented API as of writing.

## Architecture

```
UI (app/, screens)
  ↓
Zustand stores (src/stores)
  ↓
Services (src/services) — validation, business rules
  ↓
Repositories (src/database/repositories) — CRUD only
  ↓
SQLite (Drizzle ORM) + MMKV
```

Each layer only talks to the layer directly below it. See `docs/04-Architecture/01-System-Architecture.md` for the full rationale — this scaffold follows it exactly.

## Folder structure

```
app/                  Expo Router routes (Routine, Skills, To-Do, Insights tabs; modal; onboarding)
src/
  components/          Reusable, theme-aware UI primitives
  database/
    schema/            Drizzle table definitions
    migrations/        Forward-only SQL migrations
    repositories/       CRUD + queries
    client.ts           Shared Drizzle instance
    mmkv.ts              Lightweight preference storage
  services/            Business logic layer
  stores/              Zustand stores, one per feature
  theme/               Design tokens (colors, typography, spacing, motion)
  hooks/               useTheme, etc.
  utils/               id, date, error types, auto icon-assignment
  types/               Shared domain types
```

## Design system

Dark-only V1 theme per `docs/03-Design/02-Design-Tokens.md`: black background (`#000000`), red accent (`#D72638`), Inter typography, 8px spacing scale, Lucide icons (auto-assigned — users never pick icons), 150–250ms ease-out motion, and full Reduce Motion support.

## Fonts

`@expo-google-fonts/inter` is loaded in `app/_layout.tsx` via `useFonts` before anything renders, matching the family names referenced in `src/theme/typography.ts`.

## A file you'll see appear on first run

The first time you run `npx expo start` (or `expo export`), NativeWind will automatically create `nativewind-env.d.ts` in the project root and add it to `tsconfig.json`'s `include` list. That's expected — it's a generated TypeScript declaration file for Tailwind class names, not something that indicates a problem. It's not included in this zip on purpose (no point shipping a generated file); it'll regenerate itself.

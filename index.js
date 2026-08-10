// Custom entry point (package.json "main": "./index.js").
//
// react-native-get-random-values MUST be the very first import, before
// anything else in the app (including expo-router/entry below). The `uuid`
// package — used by generateId() in src/utils/id.ts, called from every
// create action (habits, skills, to-dos, completions, sessions) — needs
// crypto.getRandomValues() to generate a UUID. Hermes (React Native's JS
// engine) doesn't provide that by default; this import patches it onto the
// global object. Without it, every generateId() call throws
// "crypto.getRandomValues() not supported", every create action's promise
// silently rejects with nothing catching it, and every "Save" button in the
// app appears to do nothing at all when pressed — which is exactly the bug
// this fixes. Import order matters here: if this ran after any code that
// already imported `uuid` and cached its (missing) crypto reference, the
// polyfill would be too late.
import 'react-native-get-random-values';

// Expo Router still owns app navigation/rendering; we additionally register
// the widget task handler so Android can invoke it in a headless JS context
// (app launch, widget add/update/click/resize) per
// docs/06-Implementation/08-Widget-Implementation.md.
import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widget-task-handler';

registerWidgetTaskHandler(widgetTaskHandler);

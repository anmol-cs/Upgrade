const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle ships its migrations as raw .sql files (src/database/migrations/*.sql),
// imported directly in migrations.js. Metro doesn't recognize .sql as a source
// extension by default, so without this line it would refuse to resolve those
// imports at all ("Unable to resolve module ... from .../migrations.js").
// The actual *content* of each .sql file is inlined as a string by the
// babel-plugin-inline-import plugin configured in babel.config.js — this line
// only makes Metro willing to hand the file to Babel in the first place.
config.resolver.sourceExts.push('sql');

// Wires up NativeWind v4's CSS-based styling pipeline (the `import
// '../global.css'` in app/_layout.tsx, and Tailwind class names on components)
// so Metro actually processes global.css through Tailwind before bundling.
// nativewind/babel (in babel.config.js) alone is not enough — without this
// wrapper, tailwind classes are silently ignored rather than erroring, which
// makes the gap easy to miss until the app renders with no styling at all.
module.exports = withNativeWind(config, { input: './global.css' });

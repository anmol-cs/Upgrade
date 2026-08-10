module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: { "@": "./src" },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
      // Drizzle's migration files import raw .sql text (see
      // src/database/migrations/migrations.js) — Metro has no built-in .sql
      // handling, so this plugin inlines each .sql file's contents as a plain
      // string constant at Babel-transform time, before Metro's own resolver
      // ever needs to understand the extension. Must pair with
      // metro.config.js's `resolver.sourceExts.push('sql')`, which lets Metro
      // treat .sql as a valid *source* file to hand to Babel in the first
      // place (without that, Metro would refuse to resolve the import at all,
      // regardless of what this plugin does with it afterward).
      ["inline-import", { extensions: [".sql"] }],
      // react-native-reanimated's plugin must be listed last (Reanimated's own
      // requirement — it needs to see the fully-transformed output of every
      // other plugin above it).
      "react-native-reanimated/plugin",
    ],
  };
};

const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withDevelopmentHttp(config) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
  const allowInsecureHttp =
    process.env.EXPO_PUBLIC_ALLOW_INSECURE_HTTP === "true" &&
    apiUrl.startsWith("http://");

  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) {
      throw new Error("Android manifest is missing its application element.");
    }

    if (allowInsecureHttp) {
      application.$["android:usesCleartextTraffic"] = "true";
    } else {
      delete application.$["android:usesCleartextTraffic"];
    }

    return config;
  });
};

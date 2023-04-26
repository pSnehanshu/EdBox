// @ts-check

/**
 * @param {import('expo/config').ConfigContext} ctx
 * @returns {Partial<import('expo/config').ExpoConfig>}
 */
module.exports = ({ config }) => ({
  ...config,
  plugins: ["expo-image-picker"],
  extra: {
    ...config.extra,
    backendHost: process.env.BE_HOST,
    schoolId: process.env.SCHOOLID,
  },
  jsEngine: "hermes",
});

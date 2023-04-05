/**
 * @param {import('expo/config').ConfigContext} ctx
 * @returns {import('expo/config').ExpoConfig}
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    backendHost: process.env.HOSTNAME,
    schoolId: process.env.SCHOOLID,
  },
});

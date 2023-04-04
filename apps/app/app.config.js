module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    backendHost: process.env.HOSTNAME,
    schoolId: process.env.SCHOOLID,
  },
});

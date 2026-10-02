// Keeps the Google Maps key out of git: it comes from GOOGLE_MAPS_API_KEY
// (.env locally, EAS environment variables on cloud builds).
module.exports = ({ config }) => ({
  ...config,
  plugins: config.plugins.map((plugin) =>
    plugin === 'react-native-maps'
      ? [
          'react-native-maps',
          {
            iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
          },
        ]
      : plugin
  ),
});

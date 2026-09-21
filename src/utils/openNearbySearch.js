import { Linking } from 'react-native';

// Opens the device's default maps app (or Google Maps in a browser as a
// fallback) with a search for the given query, e.g. "food banks near me".
export default function openNearbySearch(query) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  Linking.openURL(url);
}

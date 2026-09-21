// Native (iOS/Android) has no window.google - the Places Autocomplete
// widget used on web only works in a browser. This hits the Places HTTP
// API directly with fetch, which works the same on every platform, so
// native gets real search suggestions instead of a plain text field.
const PLACES_API_KEY = "REDACTED";

export async function fetchPlacePredictions(input, types) {
  if (!input || !input.trim()) return [];

  const params = new URLSearchParams({ input, key: PLACES_API_KEY });
  if (types) params.set('types', types);

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`);
    const json = await response.json();
    if (json.status !== 'OK') {
      if (json.status !== 'ZERO_RESULTS') {
        console.error('Places autocomplete error:', json.status, json.error_message);
      }
      return [];
    }
    return json.predictions || [];
  } catch (e) {
    console.error('Places autocomplete request failed:', e);
    return [];
  }
}

export async function fetchPlaceDetails(placeId) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'formatted_address,geometry',
    key: PLACES_API_KEY,
  });

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`);
    const json = await response.json();
    if (json.status !== 'OK') {
      console.error('Place details error:', json.status, json.error_message);
      return null;
    }
    return json.result;
  } catch (e) {
    console.error('Place details request failed:', e);
    return null;
  }
}

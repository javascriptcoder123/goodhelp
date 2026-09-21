// Native (iOS/Android) has no window.google - the Places Autocomplete
// widget used on web only works in a browser. This hits the Places API
// (New) directly with fetch, which works the same on every platform, so
// native gets real search suggestions instead of a plain text field.
//
// This key only has "Places API (New)" enabled, not the legacy
// place/autocomplete/json REST API, so these calls use the new
// places.googleapis.com endpoints (POST + JSON, X-Goog-Api-Key header)
// rather than the old GET-with-key-in-query-string ones.
const PLACES_API_KEY = "REDACTED";

export async function fetchPlacePredictions(input, includedPrimaryTypes) {
  if (!input || !input.trim()) return [];

  const body = { input };
  if (includedPrimaryTypes) body.includedPrimaryTypes = [includedPrimaryTypes];

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (json.error) {
      console.error('Places autocomplete error:', json.error.status, json.error.message);
      return [];
    }
    return (json.suggestions || [])
      .map(s => s.placePrediction)
      .filter(Boolean)
      .map(p => ({ placeId: p.placeId, description: p.text?.text }));
  } catch (e) {
    console.error('Places autocomplete request failed:', e);
    return [];
  }
}

export async function fetchPlaceDetails(placeId) {
  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'formattedAddress,location',
      },
    });
    const json = await response.json();
    if (json.error) {
      console.error('Place details error:', json.error.status, json.error.message);
      return null;
    }
    return {
      formatted_address: json.formattedAddress,
      geometry: json.location ? { location: { lat: json.location.latitude, lng: json.location.longitude } } : null,
    };
  } catch (e) {
    console.error('Place details request failed:', e);
    return null;
  }
}

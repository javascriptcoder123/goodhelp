import { Platform } from 'react-native';

const SCRIPT_URL = "https://maps.googleapis.com/maps/api/js?key=REDACTED&libraries=places,geometry";

let loadPromise;

// Loads the Google Maps JS SDK at most once, no matter how many
// components (SearchLocationInput, SearchZipCode, ...) request it or how
// many times they mount. Loading the script more than once makes Google
// log "included the Google Maps JavaScript API multiple times" and can
// leave google.maps.places in a broken state, which is what made the
// autocomplete silently stop working.
export default function loadGoogleMapsScript() {
  if (Platform.OS !== "web") {
    return Promise.resolve();
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = SCRIPT_URL;
      script.onload = () => resolve();
      script.onerror = () => {
        loadPromise = undefined;
        reject(new Error("Failed to load Google Maps script"));
      };
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  }

  return loadPromise;
}

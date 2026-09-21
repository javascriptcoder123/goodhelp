import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TextInput, Platform } from 'react-native';
import loadGoogleMapsScript from '../utils/loadGoogleMapsScript';

function handleScriptLoad(updateQuery, autoCompleteRef, props) {
  const autoComplete = new window.google.maps.places.Autocomplete(
    autoCompleteRef.current,
    { types: [] }
  );
  autoComplete.setFields(["address_components", "formatted_address", "geometry"]);
  autoComplete.addListener("place_changed", () =>
    handlePlaceSelect(autoComplete, updateQuery, props)
  );
}

async function handlePlaceSelect(autoComplete, updateQuery, props) {
  const addressObject = autoComplete.getPlace();
  // Pressing Enter (or blurring) without picking a suggestion from the
  // dropdown returns a place with no geometry - bail out instead of
  // crashing so the rest of the form keeps working.
  if (!addressObject || !addressObject.geometry) {
    return;
  }
  const query = addressObject.formatted_address;
  updateQuery(query);
  var lat = addressObject.geometry.location.lat();
  var lng = addressObject.geometry.location.lng();
  props.setLocation(query)
  props.setlatLng({lat: lat, lng: lng})
}

function SearchLocationInput(props) {
  const [query, setQuery] = useState("");
  const autoCompleteRef = useRef(null);

  useEffect(() => {
    // The Autocomplete widget is built on the browser-only Google Maps JS
    // SDK (window.google) - there's no native equivalent, so skip it off
    // web rather than crash with "Cannot read property 'maps' of undefined".
    if (Platform.OS !== "web") return;
    loadGoogleMapsScript().then(
      () => handleScriptLoad(setQuery, autoCompleteRef, props)
    );
  }, []);

  useEffect(() => {
    setQuery(props.location)
  }, [props.location]);

  function onchange(event) {
    setQuery(event.target.value)
  }

  return (
      <TextInput
        style={[styles.input, props.style]}
        ref={autoCompleteRef}
        onChange={event => setQuery(event.target.value)}
        placeholder="Enter a City"
        value={query}
      />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#e7e7e7",
    paddingLeft: 10,
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: 16,
  },
  inputdiv: {
    marginBottom: 12,
    marginTop: 12,
  },
})

export default SearchLocationInput;
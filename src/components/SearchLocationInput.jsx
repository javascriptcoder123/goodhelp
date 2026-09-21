import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import loadGoogleMapsScript from '../utils/loadGoogleMapsScript';
import { fetchPlaceDetails, fetchPlacePredictions } from '../utils/placesAutocomplete';

function handleScriptLoad(updateQuery, autoCompleteRef, props) {
  const autoComplete = new window.google.maps.places.Autocomplete(
    autoCompleteRef.current,
    { types: [] }
  );
  autoComplete.setFields(["address_components", "formatted_address", "geometry"]);
  autoComplete.addListener("place_changed", () =>
    handleWebPlaceSelect(autoComplete, updateQuery, props)
  );
}

async function handleWebPlaceSelect(autoComplete, updateQuery, props) {
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
  const [predictions, setPredictions] = useState([]);
  const autoCompleteRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    // The Autocomplete widget is built on the browser-only Google Maps JS
    // SDK (window.google) - there's no native equivalent, so native uses
    // the REST-based search below instead.
    if (Platform.OS !== "web") return;
    loadGoogleMapsScript().then(
      () => handleScriptLoad(setQuery, autoCompleteRef, props)
    );
  }, []);

  useEffect(() => {
    setQuery(props.location)
  }, [props.location]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChangeText = (text) => {
    setQuery(text);
    props.setLocation?.(text);
    clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setPredictions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const results = await fetchPlacePredictions(text);
      if (requestId === requestIdRef.current) {
        setPredictions(results);
      }
    }, 300);
  };

  const handleSelectPrediction = async (prediction) => {
    setQuery(prediction.description);
    setPredictions([]);
    const details = await fetchPlaceDetails(prediction.place_id);
    const formatted = details?.formatted_address || prediction.description;
    props.setLocation?.(formatted);
    if (details?.geometry?.location) {
      props.setlatLng?.({ lat: details.geometry.location.lat, lng: details.geometry.location.lng });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, props.style]}
        ref={autoCompleteRef}
        onChange={Platform.OS === 'web' ? (event => setQuery(event.target.value)) : undefined}
        onChangeText={Platform.OS !== 'web' ? handleChangeText : undefined}
        placeholder="Enter a City"
        value={query}
      />
      {predictions.length > 0 && (
        <View style={styles.dropdown}>
          {predictions.map(item => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.option}
              onPress={() => handleSelectPrediction(item)}
            >
              <Text numberOfLines={1}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  input: {
    backgroundColor: "#e7e7e7",
    paddingLeft: 10,
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    maxHeight: 220,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputdiv: {
    marginBottom: 12,
    marginTop: 12,
  },
})

export default SearchLocationInput;

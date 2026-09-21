import React from 'react';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';

import Button from '../components/Button';
import openNearbySearch from '../utils/openNearbySearch';

export default function GuestHomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Good Help</Text>
      <Text style={styles.subtitle}>Browse donations near you</Text>
      <View style={styles.buttons}>
        <Button mode="contained" onPress={() => navigation.navigate('Accept Food')} style={styles.default}>
          Accept Food
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('Accept Clothes')} style={styles.default}>
          Accept Clothes
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('Adopt Animals')} style={styles.default}>
          Rescue Animals
        </Button>
        <Button mode="contained" onPress={() => openNearbySearch('food banks near me')} style={styles.default}>
          Find Food Banks
        </Button>
        <Button mode="contained" onPress={() => openNearbySearch('animal shelters near me')} style={styles.default}>
          Find Animal Shelters
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('LoginScreen')} style={styles.signIn}>
          Sign In
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white',
  },
  logo: {
    fontWeight: "bold",
    color: "white",
    width: 200,
    marginBottom: 12,
    fontSize: 40,
    textAlign: "center",
    backgroundColor: "blue",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  buttons: {
    alignItems: "center",
  },
  default: {
    backgroundColor: 'blue',
    width: 220,
    fontSize: 15,
  },
  signIn: {
    backgroundColor: 'green',
    width: 220,
    fontSize: 15,
    marginTop: 16,
  },
});

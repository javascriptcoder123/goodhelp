import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, createContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createSwitchNavigator, createAppContainer, createNavigatorFactory } from '@react-navigation/native';
import { Button } from 'react-native';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, store, firestore } from './firebase.js';

//  Import of all screens
import ShareFood from './src/screens/ShareFood'
import ShareClothes from './src/screens/ShareClothes'
import PostAnimals from './src/screens/PostAnimals'

import AcceptFood from './src/screens/AcceptFood'
import AcceptClothes from './src/screens/AcceptClothes'
import AcceptAnimals from './src/screens/AcceptAnimals'

import DonationScreen from './src/screens/DonationScreen'

import HomeScreen from './src/screens/HomeScreen'
import GuestHomeScreen from './src/screens/GuestHomeScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import ResetPasswordScreen from './src/screens/ResetPasswordScreen'

import MapScreen from './src/screens/MapScreen'

export default function AuthNavigator() {
    const [user, setUser] = useState(true);

    const addUser = async (value) => {
      try {
        await AsyncStorage.setItem('user', JSON.stringify(value))
        setUser(value)
        const jsonValue = await AsyncStorage.getItem('user')
        console.log("VALUE SET", JSON.parse(jsonValue))
      } catch (e) {
        // saving error
      }
    }

    const getUser = async () => {
      try {
        AsyncStorage.getItem('user').then(value => {
          console.log("VALUE GET", JSON.parse(value))
          if (value != "null") {
            setUser(JSON.parse(value))
          }
        })
      } catch(e) {
        // error reading value
      }
    }

    useEffect(() => {
      getUser()
    }, [])

    function login(a) {
        addUser(a)
        const userRef = store.collection('users').doc(a.email);

        userRef.get().then((doc) => {
            if (doc.exists) {
                console.log("LOGIN")
            } else {
                console.log("REGISTER USER", userRef)
                if (a.picture) {
                    userRef.set({
                        name: a.name || "",
                        email: a.email || "",
                        picture: a.picture.data.url,
                        about: "",
                        donationsMade: 0,
                        donationsAccepted: 0,
                    })
                } else {
                    console.log("CREATE")
                    userRef.set({
                        name: a.name || "",
                        email: a.email || "",
                        picture: "https://www.edmundsgovtech.com/wp-content/uploads/2020/01/default-picture_0_0.png",
                        about: "",
                        donationsMade: 0,
                        donationsAccepted: 0,
                    })
                }
            }
        })
    }

    function logout() {
        auth.signOut()
        addUser(null)
    }

    async function deleteAccount() {
        const currentUser = auth.currentUser
        if (!currentUser) {
            addUser(null)
            return { success: true }
        }

        try {
            // Delete the Auth account first so a failure here (e.g. the user
            // needs to reauthenticate) doesn't leave the Firestore doc deleted
            // while the login still exists.
            await deleteUser(currentUser)
        } catch (e) {
            console.log("ERROR DELETING ACCOUNT", e)
            return { success: false, error: e }
        }

        try {
            await deleteDoc(doc(firestore, 'users', currentUser.email))
        } catch (e) {
            console.log("ERROR DELETING USER DATA", e)
        }

        addUser(null)
        return { success: true }
    }

    return (
      <NavigationContainer>
        {user ? (
          <MyTabs user={user} logout={logout} deleteAccount={deleteAccount} />
        ) : (
          <MyStack login={login} />
        )}
      </NavigationContainer>
    );
}

const AuthStack = createStackNavigator();

function MyStack(props) {
  return (
      <AuthStack.Navigator initialRouteName="GuestHome">
        <AuthStack.Screen name="GuestHome" component={GuestHomeScreen} options={{ title: 'Goodhelp', headerShown: false }} />
        <AuthStack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Goodhelp - Login', headerShown: false }} initialParams={{login: props.login}} />
        <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: 'Goodhelp - Register', headerShown: false }} initialParams={{login: props.login}} />
        <AuthStack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ title: 'Goodhelp - Reset Password', headerShown: false }} />
        <AuthStack.Screen
          name="Accept Food"
          component={AcceptFood}
          options={({ navigation }) => ({
            headerRight: () => (
              <Button
                onPress={() => navigation.navigate('MapScreen', { fromScreen: 'food' })}
                title="map"
                color="black"
              />
            ),
          })}
        />
        <AuthStack.Screen
          name="Accept Clothes"
          component={AcceptClothes}
          options={({ navigation }) => ({
            headerRight: () => (
              <Button
                onPress={() => navigation.navigate('MapScreen', { fromScreen: 'clothes' })}
                title="map"
                color="black"
              />
            ),
          })}
        />
        <AuthStack.Screen name="Adopt Animals" component={AcceptAnimals} />
        <AuthStack.Screen name="Donation Screen" component={DonationScreen} />
        <AuthStack.Screen name="MapScreen" component={MapScreen} />
      </AuthStack.Navigator>
  );
}

const AppStack = createStackNavigator();

function MyTabs(props) {
    return (
        <AppStack.Navigator
          initialRouteName="Home"
        >
          <AppStack.Screen
            name="Home"
            component={HomeScreen}
            initialParams={{user: props.user, logout: props.logout, deleteAccount: props.deleteAccount}}
            options={{
              title: 'Home',
            }}
          />
          <AppStack.Screen
            name="Share Food"
            component={ShareFood}
            initialParams={{user: props.user, logout: props.logout}}
          />
          <AppStack.Screen
            name="Share Clothes"
            component={ShareClothes}
            initialParams={{user: props.user, logout: props.logout}}
          />
          <AppStack.Screen
            name="Post Animals"
            component={PostAnimals}
            initialParams={{user: props.user, logout: props.logout}}
          />
          <AppStack.Screen
            name="Accept Food"
            component={AcceptFood}
            initialParams={{user: props.user, logout: props.logout}}
            options={({ navigation }) => ({
              headerRight: () => (
                <Button
                  onPress={() => navigation.navigate('MapScreen', { fromScreen: 'food' })}
                  title="map"
                  color="black"
                />
              ),
            })}
          />
          <AppStack.Screen
            name="Accept Clothes"
            component={AcceptClothes}
            initialParams={{user: props.user, logout: props.logout}}
            options={({ navigation }) => ({
              headerRight: () => (
                <Button
                  onPress={() => navigation.navigate('MapScreen', { fromScreen: 'clothes' })}
                  title="map"
                  color="black"
                />
              ),
            })}
          />
          <AppStack.Screen
            name="Adopt Animals"
            component={AcceptAnimals}
            initialParams={{user: props.user, logout: props.logout}}
          />
          <AppStack.Screen
            name="Donation Screen"
            component={DonationScreen}
            initialParams={{user: props.user, logout: props.logout}}
          />
          <AppStack.Screen 
            name="MapScreen" 
            component={MapScreen}
          />
        </AppStack.Navigator>
    );
}

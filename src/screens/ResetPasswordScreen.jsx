import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '../../firebase';
import Button from '../components/Button';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState({ value: '', error: '' });
  const navigation = useNavigation();

  function emailValidator(email) {
    const re = /\S+@\S+\.\S+/;
    if (!email) return "Email can't be empty.";
    if (!re.test(email)) return 'Ooops! We need a valid email address.';
    return '';
  }

  const onResetPressed = () => {
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    sendPasswordResetEmail(auth, email.value)
      .then(() => {
        Alert.alert(
          'Check your email',
          'We sent a password reset link to your email address.',
          [{ text: 'OK', onPress: () => navigation.navigate('LoginScreen') }]
        );
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.logo}>Good Help</Text>
        <Text style={styles.subtitle}>Enter your email to reset your password</Text>
        <TextInput
          label="Email"
          returnKeyType="done"
          theme={{ colors: { primary: 'blue', underlineColor: 'transparent' } }}
          style={{ width: 300 }}
          value={email.value}
          onChangeText={(text) => setEmail({ value: text, error: '' })}
          error={!!email.error}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
        {!!email.error && <Text style={styles.error}>{email.error}</Text>}
      </View>
      <View style={styles.row}>
        <Button mode="contained" onPress={onResetPressed} style={styles.default}>
          Send reset link
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.link}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'column',
    marginTop: 4,
    alignItems: 'center',
  },
  link: {
    fontWeight: 'bold',
    marginTop: 16,
    color: 'blue',
  },
  form: {
    alignItems: 'center',
    padding: 40,
    marginLeft: 80,
    marginTop: 40,
    marginRight: 120,
  },
  logo: {
    fontWeight: 'bold',
    color: 'white',
    width: 200,
    marginBottom: 16,
    fontSize: 40,
    backgroundColor: 'blue',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    width: 300,
  },
  default: {
    backgroundColor: 'green',
    width: 300,
  },
  container: {
    alignItems: 'center',
    padding: 40,
    flex: 1,
    backgroundColor: 'white',
  },
});

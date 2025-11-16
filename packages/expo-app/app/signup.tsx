import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';

/**
 * The main App component.
 * This is a minimal sign-up screen with Full Name, Username, Email, and Password.
 */
export default function App() {
  // State to hold the sign-up fields
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  /**
   * Handles the sign-up button press.
   */
  const handleSignUp = () => {
    // Basic validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // In a real app, you'd send this to your backend to create a user.
    Alert.alert(
      'Sign Up Successful',
      `Account created for: ${fullName} (@${username})`
    );
    console.log('Sign up attempt with:', { fullName, username, email, password });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        {/* Full Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          onChangeText={setFullName}
          value={fullName}
          autoCapitalize="words" // Capitalizes the first letter of each word
          placeholderTextColor="#888"
        />

        {/* Username Input */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
          placeholderTextColor="#888"
        />

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true} // Hides the password
          placeholderTextColor="#888"
        />

        {/* Confirm Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          secureTextEntry={true} // Hides the password
          placeholderTextColor="#888"
        />

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * A minimal stylesheet.
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 44,
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  signUpButton:{
    backgroundColor: '#007AFF', // A standard blue color
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
    marginBottom: 16, // Space below the login button
  },
  signUpButtonText:{
    color: '#ffffff', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
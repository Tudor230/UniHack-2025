import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  Button, // 1. Import Button
  ActivityIndicator, // 2. Import ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router'; // 3. Import useRouter

// 4. DEFINE YOUR API ENDPOINT
const SIGNUP_API_ENDPOINT = 'https://your-api.com/signup'; // <-- REPLACE THIS

export default function App() {
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // 5. Add loading state
  const router = useRouter(); // 6. Get the router instance

  /**
   * Handles the sign-up button press.
   */
  const handleSignUp = async () => { // 7. Make the function async
    // Basic validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true); // 8. Set loading to true

    try {
      // 9. Send the network request
      const response = await fetch(SIGNUP_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName,
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json(); // 10. Parse the JSON response

      // 11. Handle the response
      if (response.ok) {
        Alert.alert(
          'Sign Up Successful',
          'Your account has been created. Please log in.'
        );
        // 12. Navigate to login page
        // 'replace' stops user from going "back" to signup
        router.replace('/login'); 
      } else {
        Alert.alert('Sign Up Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      // 13. Handle network errors
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      // 14. Set loading to false
      setIsLoading(false);
    }
  };

  /**
   * Handles navigating back to the login screen.
   */
  const handleGoToLogin = () => {
    router.replace('/login'); // Use replace to ensure stable navigation
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          onChangeText={setFullName}
          value={fullName}
          autoCapitalize="words"
          placeholderTextColor="#888"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
          placeholderTextColor="#888"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholderTextColor="#888"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          secureTextEntry={true}
          placeholderTextColor="#888"
          editable={!isLoading}
        />

        {/* 15. Modify Sign Up Button for loading state */}
        <TouchableOpacity 
          style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* 16. Add "Go to Login" button */}
        <View style={styles.loginButtonContainer}>
          <Button
            title="Already have an account? Log In"
            onPress={handleGoToLogin}
            color="#007AFF"
            disabled={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signUpButtonDisabled: {
    backgroundColor: '#007AFF',
    opacity: 0.7,
  },
  signUpButtonText:{
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButtonContainer: {
    marginTop: 10,
  },
});
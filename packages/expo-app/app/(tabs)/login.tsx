import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
// 1. Import 'useRouter' from 'expo-router'
import { useRouter } from 'expo-router';

/**
 * The main App component.
 * This is a minimal login screen as requested.
 */
export default function App() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // 2. Get the router instance
  const router = useRouter();

  /**
   * Handles the login button press.
   */
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    Alert.alert('Login Attempt', `Email: ${email}\nPassword: ${password}`);
    console.log('Login attempt with:', { email, password });
  };

  /**
   * Handles the sign-up navigation press.
   * This now uses the router to navigate to the sign-up screen.
   */
  const handleSignUpNavigation = () => {
    // 3. Use router.push to navigate to the 'signup' route.
    //    Expo Router will automatically find your 'signup.tsx' file.
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

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
          secureTextEntry={true}
          placeholderTextColor="#888"
        />

        {/* Styled Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* "Don't have an account?" Button */}
        <View style={styles.signUpButtonContainer}>
          <Button
            title="Don't have an account? Sign Up"
            onPress={handleSignUpNavigation} // This now works
            color="#007AFF"
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
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButtonContainer: {
    marginTop: 10,
  },
});
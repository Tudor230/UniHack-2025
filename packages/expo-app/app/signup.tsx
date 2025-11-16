import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router'; // 3. Import useRouter
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/state/auth';
import { jwtDecode } from 'jwt-decode';

// 4. DEFINE YOUR API ENDPOINT
const SIGNUP_API_ENDPOINT = 'https://backend-507j.onrender.com/register'; // <-- REPLACE THIS

export default function App() {
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // 5. Add loading state
  const router = useRouter(); // 6. Get the router instance
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { login } = useAuth();

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
          'Your account has been created.'
        );
        // 2. Decode the token
        const decodedToken: any = jwtDecode(data.token);

        // 3. Find the username (it's probably the one you just sent)
        const usernameToSave = decodedToken.username || decodedToken.email || decodedToken.name || decodedToken.sub || username;

        // 4. Call login with the token AND the extracted username
        await login(data.token, usernameToSave);
        router.replace('/guide');
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.container}>
        <View style={{ position: 'absolute', top: insets.top + 10, left: 20, zIndex: 1000 }}>
          <TouchableOpacity
            onPress={() => {
              const canGoBack = typeof (router as any).canGoBack === 'function' ? (router as any).canGoBack() : false;
              if (canGoBack) {
                router.back();
              } else {
                router.replace('/guide');
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Sign Up</Text>

        <TextInput
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon, color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Full Name"
          onChangeText={setFullName}
          value={fullName}
          autoCapitalize="words"
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          editable={!isLoading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon, color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Username"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          editable={!isLoading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon, color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          editable={!isLoading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon, color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          editable={!isLoading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon, color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Confirm Password"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          secureTextEntry={true}
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          editable={!isLoading}
        />

        {/* 15. Modify Sign Up Button for loading state */}
        <TouchableOpacity 
          style={[styles.signUpButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }, isLoading && styles.signUpButtonDisabled]} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginButtonContainer}>
          <TouchableOpacity
            style={styles.transparentButton}
            onPress={handleGoToLogin}
            disabled={isLoading}
            activeOpacity={0.6}
          >
            <Text style={[styles.loginLinkText, { color: Colors[colorScheme ?? 'light'].tint }]}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
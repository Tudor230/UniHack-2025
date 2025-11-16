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
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/state/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { jwtDecode } from 'jwt-decode';

// 2. DEFINE YOUR API ENDPOINT
const LOGIN_API_ENDPOINT = 'https://backend-507j.onrender.com/login'; // <-- REPLACE THIS

export default function App() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // 3. Add loading state
  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const handleBackOrMain = () => {
    const canGoBack = typeof (router as any).canGoBack === 'function' ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace('/guide');
    }
  };

  /**
   * Handles the login button press.
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(LOGIN_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- THIS IS THE FIX ---
        
        // 2. Decode the token
        const decodedToken: any = jwtDecode(data.token);
        
        // 3. Add this log to see what's inside the token
        console.log('Decoded Token Payload:', decodedToken);
        
        // 4. Find the username. Common keys are 'username', 'email', 'name', or 'sub'.
        //    Check your console log to see which one your API uses.
        const usernameToSave = decodedToken.username || decodedToken.email || decodedToken.name || decodedToken.sub || 'User';

        // 5. Call login with the token AND the extracted username
        await login(data.token, usernameToSave);
        // --- END FIX ---

        router.replace('/guide');
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the sign-up navigation press.
   */
  const handleSignUpNavigation = () => {
    router.push('/signup');
  };

  const handleGoToMain = () => {
    // We use 'replace' to take the login screen out of the history
    router.replace('/guide'); // Or change '/map' to your main app route
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.container}>
        <View style={{ position: 'absolute', top: insets.top + 10, left: 20, zIndex: 1000 }}>
          <TouchableOpacity onPress={handleBackOrMain} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Login</Text>

        <TextInput
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon, color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          editable={!isLoading} // Disable input while loading
        />

        <TextInput
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon, color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          editable={!isLoading} // Disable input while loading
        />

        {/* 12. Modify Login Button to show loading state */}
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }, isLoading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signUpButtonContainer}>
          <TouchableOpacity
            style={styles.transparentButton}
            onPress={handleSignUpNavigation}
            disabled={isLoading}
            activeOpacity={0.6}
          >
            <Text style={[styles.signUpText, { color: Colors[colorScheme ?? 'light'].tint }]}>Don't have an account? Sign Up</Text>
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
  loginButtonDisabled: {
    opacity: 0.7, // Make it look disabled
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
  signUpText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
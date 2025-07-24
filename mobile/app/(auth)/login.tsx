import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const Login = () => {
  type FormField = 'email' | 'password';

  const [formData, setFormData] = useState<Record<FormField, string>>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Too short';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('https://0hnvvn91-5000.inc1.devtunnels.ms/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      await SecureStore.setItemAsync('authToken', data.token);
      setFormData({ email: '', password: '' });

      Alert.alert('Success', 'Logged in successfully!', [
        { text: 'OK', onPress: () => router.push('/') },
      ]);
    } catch (err: any) {
      if (err.message.includes('email') || err.message.includes('password')) {
        setErrors({ email: 'Invalid email or password' });
      } else {
        Alert.alert('Error', err.message || 'Try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-indigo-50" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center">
          <Text className="text-3xl font-bold text-center text-indigo-700 mb-8">Welcome Back</Text>
          <Text className="text-center text-gray-500 mb-8">Sign in to your account</Text>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3"
            />
            {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-1">Password</Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
              <TextInput
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                className="flex-1 py-3"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6366f1"
                />
              </Pressable>
            </View>
            {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
          </View>

          {/* Forgot Password */}
          <Pressable className="mb-6">
            <Text className="text-indigo-700 text-sm font-semibold text-right">
              Forgot Password?
            </Text>
          </Pressable>

          {/* Submit Button */}
          <Pressable
            disabled={loading}
            onPress={handleSubmit}
            className={`bg-indigo-600 py-4 rounded-xl flex-row items-center justify-center ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="log-in" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Sign In</Text>
              </>
            )}
          </Pressable>

          <Text className="text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Text
              className="text-indigo-700 font-bold underline"
              onPress={() => router.push('/register')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
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

const Register = () => {
  type FormField = 'name' | 'email' | 'password' | 'confirmPassword';

  const [formData, setFormData] = useState<Record<FormField, string>>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [success, setSuccess] = useState(false);

  const handleChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Too short';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Too short';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('https://0hnvvn91-5000.inc1.devtunnels.ms/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'student' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      await SecureStore.setItemAsync('authToken', data.token);
      setSuccess(true);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });

      Alert.alert('Success', 'Registered successfully!', [
        { text: 'OK', onPress: () => router.push('/login') },
      ]);
    } catch (err: any) {
      if (err.message.includes('email')) setErrors({ email: 'Email already exists' });
      else Alert.alert('Error', err.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 justify-center items-center bg-indigo-50 px-6">
        <Ionicons name="checkmark-circle" size={80} color="#10b981" />
        <Text className="text-2xl font-bold mt-4 text-gray-800">Welcome Aboard 🎉</Text>
        <Text className="text-center text-gray-500 mt-2 mb-6">
          Your account has been created successfully.
        </Text>
        <Pressable
          className="bg-emerald-500 px-6 py-3 rounded-xl flex-row items-center"
          onPress={() => router.push('/login')}
        >
          <Ionicons name="arrow-forward" size={20} color="white" />
          <Text className="text-white ml-2 font-semibold text-base">Continue to Login</Text>
        </Pressable>
      </View>
    );
  }

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
          <Text className="text-3xl font-bold text-center text-indigo-700 mb-8">Register</Text>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">Name</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Your full name"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3"
            />
            {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
          </View>

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
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">Password</Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
              <TextInput
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Create password"
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

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-1">Confirm Password</Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                placeholder="Repeat password"
                secureTextEntry={!showConfirmPassword}
                className="flex-1 py-3"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6366f1"
                />
              </Pressable>
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
            )}
          </View>

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
                <Ionicons name="rocket" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Register</Text>
              </>
            )}
          </Pressable>

          <Text className="text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Text
              className="text-indigo-700 font-bold underline"
              onPress={() => router.push('/login')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
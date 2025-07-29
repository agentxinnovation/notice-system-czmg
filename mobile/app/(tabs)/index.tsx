import "../global.css"
import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from "react-native";
import { Bell, Calendar, Eye, Clock, LogOut } from 'lucide-react-native'; // Added LogOut icon
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

interface Notice {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  attachmentUrl?: string;
  createdById: string;
  createdAt: string;
  publishAt?: string;
  isPublished: boolean;
}

const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('https://0hnvvn91-5000.inc1.devtunnels.ms/api/notices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await handleLogout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch notices: ${response.status}`);
      }
      
      const data = await response.json();
      setNotices(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load notices');
      console.error('Error fetching notices:', err);
      setNotices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
      
      // Redirect to login page
      router.replace('/login');
    } catch (err) {
      console.error('Error during logout:', err);
      Alert.alert('Error', 'Failed to logout properly');
    }
  };

  const confirmLogout = (): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: handleLogout,
          style: 'destructive',
        },
      ]
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        router.replace('/login');
      } else {
        fetchNotices();
      }
    };
    
    checkAuth();
  }, []);

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchNotices();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const truncateText = (text?: string, maxLength: number = 120): string => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDescription = (description?: string): string => {
    if (!description) return '';
    return description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const handleViewDetails = (notice: Notice): void => {
    Alert.alert(
      notice.title || 'Notice Details',
      formatDescription(notice.description) || 'No description available',
      [{ text: 'OK' }]
    );
  };

  const handleLoginRedirect = (): void => {
    router.replace('/login');
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4 text-base">Loading notices...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Bell size={48} color="#ef4444" />
        <Text className="text-lg font-medium text-gray-900 mb-2 text-center mt-4">
          Authentication Required
        </Text>
        <Text className="text-gray-600 mb-6 text-center">{error}</Text>
        <TouchableOpacity 
          className="px-6 py-3 bg-blue-600 rounded-lg"
          onPress={handleLoginRedirect}
        >
          <Text className="text-white font-medium">Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-6 px-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Bell size={32} color="#2563eb" />
            <View className="ml-3">
              <Text className="text-2xl font-bold text-gray-900">Notices</Text>
              <Text className="text-gray-600 mt-1 text-sm">
                Stay updated with the latest announcements
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={confirmLogout}
            className="p-2 rounded-full bg-gray-100"
          >
            <LogOut size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {notices.length === 0 ? (
            <View className="bg-white rounded-lg p-12 items-center shadow-sm">
              <Bell size={48} color="#9ca3af" />
              <Text className="text-lg font-medium text-gray-900 mb-2 mt-4">
                No notices available
              </Text>
              <Text className="text-gray-600 text-center">
                Check back later for new announcements
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {notices.map((notice) => (
                <View 
                  key={notice.id} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <View className="p-4">
                    {notice.category && (
                      <View className="mb-3">
                        <View className="bg-blue-100 rounded-full px-3 py-1 self-start">
                          <Text className="text-xs font-medium text-blue-800">
                            {notice.category}
                          </Text>
                        </View>
                      </View>
                    )}

                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      {notice.title || 'Untitled Notice'}
                    </Text>

                    {notice.description && (
                      <Text className="text-gray-600 text-sm mb-4 leading-5">
                        {truncateText(formatDescription(notice.description))}
                      </Text>
                    )}

                    <View className="mb-4 gap-1">
                      <View className="flex-row items-center">
                        <Calendar size={12} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1">
                          Created: {formatDate(notice.createdAt)}
                        </Text>
                      </View>
                      {notice.publishAt && (
                        <View className="flex-row items-center">
                          <Clock size={12} color="#6b7280" />
                          <Text className="text-xs text-gray-500 ml-1">
                            Published: {formatDate(notice.publishAt)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="mb-4">
                      <View className={`rounded-full px-2 py-1 self-start ${
                        notice.isPublished 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          notice.isPublished 
                            ? 'text-green-800' 
                            : 'text-yellow-800'
                        }`}>
                          {notice.isPublished ? 'Published' : 'Draft'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleViewDetails(notice)}
                      className="bg-blue-600 rounded-lg px-4 py-3 flex-row items-center justify-between active:bg-blue-700"
                    >
                      <View className="flex-row items-center">
                        <Eye size={16} color="white" />
                        <Text className="text-white text-sm font-medium ml-2">
                          View Details
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {notice.attachmentUrl && (
                      <View className="mt-2 flex-row items-center">
                        <View className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                        <Text className="text-xs text-gray-500">Has attachment</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NoticesPage;
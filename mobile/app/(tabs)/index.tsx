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
import { Bell, Calendar, Eye, Clock } from 'lucide-react-native';

// Types
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

interface ApiResponse {
  data: Notice[] | { data: Notice[] };
  page?: number;
  totalPages?: number;
  total?: number;
}

// API service function
const getNotices = async (): Promise<ApiResponse> => {
  try {
    const token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwZDVmMzQwLWI4YjctNDAwZS1hMTc1LWM1Y2E5NWYwNWJlMyIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzUzMzgzNzg0LCJleHAiOjE3NTM5ODg1ODR9.3wgWczTrUh1DcGs1kkLSAnc5XFYwFO3gUN3raqbz8Xs'; // You'll need to get this from your auth storage
    const response = await fetch('https://0hnvvn91-5000.inc1.devtunnels.ms/api/notices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    return { data : data.data };
  } catch (error) {
    throw error;
  }
};

const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNotices();
      
      // Handle different response structures based on API docs
      if (Array.isArray(res.data)) {
        setNotices(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setNotices(res.data.data);
      } else {
        // setNotices(res.data || []);
      }
    } catch (err) {
      setError('Failed to load notices');
      console.error('Error fetching notices:', err);
      setNotices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchNotices();
  };

  // Format date helper
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

  // Truncate description helper
  const truncateText = (text?: string, maxLength: number = 120): string => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format description to handle newlines
  const formatDescription = (description?: string): string => {
    if (!description) return '';
    return description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const handleViewDetails = (notice: Notice): void => {
    // Show notice details in an alert instead of navigating
    Alert.alert(
      notice.title || 'Notice Details',
      formatDescription(notice.description) || 'No description available',
      [{ text: 'OK' }]
    );
  };

  const handleLogin = (): void => {
    // Handle login navigation here
    Alert.alert('Login Required', 'Please login to view notices');
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
          You need to login first
        </Text>
        <Text className="text-gray-600 mb-6 text-center">{error}</Text>
        <TouchableOpacity 
          className="px-6 py-3 bg-blue-600 rounded-lg"
          onPress={handleLogin}
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
        <View className="flex-row items-center">
          <Bell size={32} color="#2563eb" />
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-gray-900">Notices</Text>
            <Text className="text-gray-600 mt-1 text-sm">
              Stay updated with the latest announcements
            </Text>
          </View>
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
              {notices.map((n: Notice) => (
                <View 
                  key={n.id} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <View className="p-4">
                    {/* Category Badge */}
                    {n.category && (
                      <View className="mb-3">
                        <View className="bg-blue-100 rounded-full px-3 py-1 self-start">
                          <Text className="text-xs font-medium text-blue-800">
                            {n.category}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Title */}
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      {n.title || 'Untitled Notice'}
                    </Text>

                    {/* Description */}
                    {n.description && (
                      <Text className="text-gray-600 text-sm mb-4 leading-5">
                        {truncateText(formatDescription(n.description))}
                      </Text>
                    )}

                    {/* Metadata */}
                    <View className="mb-4 gap-1">
                      <View className="flex-row items-center">
                        <Calendar size={12} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1">
                          Created: {formatDate(n.createdAt)}
                        </Text>
                      </View>
                      {n.publishAt && (
                        <View className="flex-row items-center">
                          <Clock size={12} color="#6b7280" />
                          <Text className="text-xs text-gray-500 ml-1">
                            Published: {formatDate(n.publishAt)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Status Badge */}
                    <View className="mb-4">
                      <View className={`rounded-full px-2 py-1 self-start ${
                        n.isPublished 
                          ? 'bg-green-100' 
                          : 'bg-yellow-100'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          n.isPublished 
                            ? 'text-green-800' 
                            : 'text-yellow-800'
                        }`}>
                          {n.isPublished ? 'Published' : 'Draft'}
                        </Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      onPress={() => handleViewDetails(n)}
                      className="bg-blue-600 rounded-lg px-4 py-3 flex-row items-center justify-between active:bg-blue-700"
                    >
                      <View className="flex-row items-center">
                        <Eye size={16} color="white" />
                        <Text className="text-white text-sm font-medium ml-2">
                          View Details
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Attachment indicator */}
                    {n.attachmentUrl && (
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
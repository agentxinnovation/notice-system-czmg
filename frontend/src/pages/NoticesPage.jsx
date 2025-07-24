import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Added this import
import { getNotices } from '../services/api';
import { Bell, Calendar, Eye, ChevronRight, Clock } from 'lucide-react';

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Initialize the navigate function

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getNotices();
        
        // Handle different response structures
        if (Array.isArray(res.data)) {
          setNotices(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setNotices(res.data.data);
        } else {
          setNotices(res.data || []);
        }
      } catch (err) {
        setError('Failed to load notices');
        console.error('Error fetching notices:', err);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
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
  const truncateText = (text, maxLength = 150) => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format description to handle newlines
  const formatDescription = (description) => {
    if (!description) return '';
    // Replace newlines with spaces and clean up extra whitespace
    return description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Navigation function to notice details
  const handleViewDetails = (id) => {
    navigate(`/notice/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">You need to login first</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login 
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notices</h1>
              <p className="text-gray-600 mt-1">Stay updated with the latest announcements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notices available</h3>
            <p className="text-gray-600">Check back later for new announcements</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notices.map(n => (
              <div key={n.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Category Badge */}
                  {n.category && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {n.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {n.title || 'Untitled Notice'}
                  </h3>

                  {/* Description */}
                  {n.description && (
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {truncateText(formatDescription(n.description))}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-col space-y-1 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Created: {formatDate(n.createdAt)}</span>
                    </div>
                    {n.publishAt && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Published: {formatDate(n.publishAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      n.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {n.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewDetails(n.id)}
                    className="inline-flex items-center justify-between w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 group"
                  >
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </div>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticesPage;
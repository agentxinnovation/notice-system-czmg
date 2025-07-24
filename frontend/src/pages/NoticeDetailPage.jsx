import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useParams
import { getNoticeById } from '../services/api';
import { ArrowLeft, Calendar, Clock, Tag, User, FileText, AlertCircle } from 'lucide-react';

const NoticeDetailPage = ({ noticeId }) => {
  // Mock useParams for demonstration - replace with actual router params
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getNoticeById(id);
        setNotice(res.data);
      } catch (err) {
        setError('Failed to load notice details');
        console.error('Error fetching notice:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNotice();
    }
  }, [id]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format description to preserve line breaks
  const formatDescription = (description) => {
    if (!description) return '';
    return description.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < description.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const handleGoBack = () => {
    // navigate(-1); // Go back to previous page
    navigate('/notices') //to go to notices list
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading notice</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notice not found</h3>
          <p className="text-gray-600 mb-4">The notice you're looking for doesn't exist</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Notice Details</h1>
              <p className="text-gray-600 mt-1">View complete notice information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Notice Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Category and Status */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-3">
                  {notice.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Tag className="h-4 w-4 mr-1" />
                      {notice.category}
                    </span>
                  )}
                </div>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  notice.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {notice.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {notice.title || 'Untitled Notice'}
              </h1>

              {/* Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Created: {formatDate(notice.createdAt)}</span>
                </div>
                
                {notice.publishAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Published: {formatDate(notice.publishAt)}</span>
                  </div>
                )}
                
                {notice.createdById && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Created by: {notice.createdById}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notice Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Description
              </h3>
              
              {notice.description ? (
                <div className="text-gray-700 leading-relaxed text-base bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {formatDescription(notice.description)}
                </div>
              ) : (
                <div className="text-gray-500 italic bg-gray-50 rounded-lg p-4 border border-gray-200">
                  No description provided
                </div>
              )}
            </div>

            {/* Attachment Section */}
            {notice.attachmentUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachment</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <a
                    href={notice.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Attachment</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Notice ID: {notice.id}
              </div>
              
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Notices</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailPage;
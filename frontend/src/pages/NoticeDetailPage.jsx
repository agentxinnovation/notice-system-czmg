import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoticeById } from '../services/api';
import { ArrowLeft, Calendar, Clock, Tag, User, FileText, AlertCircle, Download, Share2, Eye, ExternalLink } from 'lucide-react';

const NoticeDetailPage = ({ noticeId }) => {
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
    navigate('/notices');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: notice?.title || 'Notice',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="space-y-2">
              <p className="text-slate-700 font-medium">Loading notice details</p>
              <p className="text-slate-500 text-sm">Please wait a moment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Notice</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
              <button
                onClick={handleGoBack}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Return to Notices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Notice Not Found</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">The notice you're looking for doesn't exist or may have been removed.</p>
              <button
                onClick={handleGoBack}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Browse All Notices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-slate-700 font-medium rounded-xl border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 hover:shadow-md backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Notice Details
                </h1>
                <p className="text-slate-600 mt-1">Complete notice information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-slate-700 rounded-xl border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 hover:shadow-md backdrop-blur-sm"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Enhanced Notice Header */}
          <div className="relative px-8 py-8 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 border-b border-slate-200/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 to-indigo-600/3"></div>
            <div className="relative space-y-6">
              {/* Status and Category */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  {notice.category && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/50 shadow-sm">
                      <Tag className="h-4 w-4 mr-2" />
                      {notice.category}
                    </span>
                  )}
                </div>
                
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm border ${
                  notice.isPublished 
                    ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200/50' 
                    : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    notice.isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></div>
                  {notice.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Enhanced Title */}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent leading-tight mb-2">
                  {notice.title || 'Untitled Notice'}
                </h1>
              </div>

              {/* Enhanced Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(notice.createdAt)}</p>
                  </div>
                </div>
                
                {notice.publishAt && (
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Published</p>
                      <p className="text-sm font-semibold text-slate-700">{formatDate(notice.publishAt)}</p>
                    </div>
                  </div>
                )}
                
                {notice.createdById && (
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created By</p>
                      <p className="text-sm font-semibold text-slate-700">ADMIN</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Notice Content */}
          <div className="px-8 py-8">
            <div className="space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Description</h3>
                </div>
                
                {notice.description ? (
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                    <div className="text-slate-700 leading-relaxed text-base prose prose-slate max-w-none">
                      {formatDescription(notice.description)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                    <div className="text-slate-500 italic text-center py-4">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p>No description provided for this notice</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Attachment Section */}
              {notice.attachmentUrl && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                      <Download className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Attachment</h3>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <a
                      href={notice.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                          <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800 group-hover:text-emerald-900">View Attachment</p>
                          <p className="text-sm text-emerald-600">Click to open in new tab</p>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-emerald-600 group-hover:text-emerald-700 transform group-hover:scale-110 transition-all duration-200" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50/80 to-blue-50/80 border-t border-slate-200/50 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-xs text-slate-500 bg-white/60 px-3 py-2 rounded-lg border border-slate-200/50">
                  <span className="font-medium">Notice ID:</span> {notice.id}
                </div>
                {notice.views && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white/60 px-3 py-2 rounded-lg border border-slate-200/50">
                    <Eye className="h-3 w-3" />
                    <span>{notice.views} views</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
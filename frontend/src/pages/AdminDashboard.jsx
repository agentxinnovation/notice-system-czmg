import React, { useEffect, useState } from 'react';
import { createNotice, deleteNotice, getNoticesAll, updateNotice } from '../services/api';
import { Plus, Edit2, Trash2, Save, X, Calendar, Tag, FileText, Settings, Bell, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const AdminDashboard = () => {
  const [form, setForm] = useState({ title: '', description: '', category: '', publishAt: '' });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', publishAt: '', isPublished: false });
  const [searchTerm, setSearchTerm] = useState('');

  const loadNotices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getNoticesAll({ page, limit: 10, all: true });
      
      // Check if response is array (non-paginated) or object (paginated)
      if (Array.isArray(res.data)) {
        setNotices(res.data);
        setCurrentPage(1);
        setTotalPages(1);
        setTotal(res.data.length);
      } else {
        // Handle paginated response
        setNotices(res.data.data || []);
        setCurrentPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await createNotice(form);
      setForm({ title: '', description: '', category: '', publishAt: '' });
      loadNotices(currentPage);
    } catch (err) {
      console.error('Failed to create notice:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice(id);
        loadNotices(currentPage);
      } catch (err) {
        console.error('Failed to delete notice:', err);
      }
    }
  };

  const startEdit = (notice) => {
    setEditingId(notice.id);
    setEditForm({
      title: notice.title,
      description: notice.description,
      category: notice.category,
      publishAt: notice.publishAt ? new Date(notice.publishAt).toISOString().slice(0, -1) : '',
      isPublished: notice.isPublished || false
    });
  };

  const handleUpdate = async (id) => {
    try {
      setUpdating(true);
      await updateNotice(id, editForm);
      setEditingId(null);
      setEditForm({ title: '', description: '', category: '', publishAt: '', isPublished: false });
      loadNotices(currentPage);
    } catch (err) {
      console.error('Failed to update notice:', err);
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', category: '', publishAt: '', isPublished: false });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filter notices based on search (client-side filtering)
  const filteredNotices = (notices || []).filter(notice => 
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadNotices(currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage notices and announcements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Notice Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Create New Notice</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter notice title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Publish At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.publishAt}
                    onChange={e => setForm({ ...form, publishAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Notice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notices Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">All Notices</h2>
                  </div>
                  <span className="text-sm text-gray-500">{total} total</span>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notices found</p>
                </div>
              ) : (
                <>
                  {/* Table Header - Hidden on mobile */}
                  <div className="hidden md:block bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="col-span-3">Title</div>
                      <div className="col-span-2">Category</div>
                      <div className="col-span-3">Description</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {filteredNotices.map((notice) => (
                      <div key={notice.id} className="px-6 py-4">
                        {editingId === notice.id ? (
                          /* Edit Form */
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Title"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={editForm.category}
                                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Category"
                              />
                              <input
                                type="datetime-local"
                                value={editForm.publishAt}
                                onChange={e => setEditForm({ ...editForm, publishAt: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <textarea
                              value={editForm.description}
                              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-20 resize-none"
                              placeholder="Description"
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`published-${notice.id}`}
                                  checked={editForm.isPublished}
                                  onChange={e => setEditForm({ ...editForm, isPublished: e.target.checked })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`published-${notice.id}`} className="text-sm text-gray-700">
                                  Published
                                </label>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdate(notice.id)}
                                  disabled={updating}
                                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updating ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  ) : (
                                    <Save className="h-3 w-3" />
                                  )}
                                  <span>{updating ? 'Saving...' : 'Save'}</span>
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  disabled={updating}
                                  className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-2 md:space-y-0">
                            {/* Title */}
                            <div className="md:col-span-3">
                              <h4 className="font-medium text-gray-900 text-sm">{notice.title}</h4>
                              <div className="md:hidden text-xs text-gray-500 mt-1">
                                Created: {formatDate(notice.createdAt)}
                              </div>
                            </div>

                            {/* Category */}
                            <div className="md:col-span-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {notice.category}
                              </span>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-3">
                              <p className="text-sm text-gray-600">
                                {truncateText(notice.description)}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2">
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-1">
                                  {notice.isPublished ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Published
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Draft
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 hidden md:block">
                                  {formatDate(notice.publishAt)}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEdit(notice)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(notice.id)}
                                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Showing page {currentPage} of {totalPages} ({total} total notices)
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </button>
                        
                        {/* Page numbers - Show only a few pages around current */}
                        <div className="hidden sm:flex items-center space-x-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium rounded ${
                                  pageNum === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
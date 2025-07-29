import React, { useEffect, useState } from "react";
import {
  createNotice,
  deleteNotice,
  getNoticesAll,
  updateNotice,
} from "../services/api";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  Tag,
  FileText,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const AdminDashboard = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    publishAt: "",
  });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    publishAt: "",
    isPublished: false,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Get current datetime in correct format for input min attribute
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Prevent keyboard input for datetime fields
  const handleDateTimeKeyDown = (e) => {
    e.preventDefault();
  };

  // Validate datetime is in the future
  const validateDateTime = (dateTimeString) => {
    if (!dateTimeString) return true; // Allow empty
    const selectedDate = new Date(dateTimeString);
    const now = new Date();
    return selectedDate >= now;
  };

  const loadNotices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getNoticesAll({ page, limit: 10, all: true });

      if (Array.isArray(res.data)) {
        setNotices(res.data);
        setCurrentPage(1);
        setTotalPages(1);
        setTotal(res.data.length);
      } else {
        setNotices(res.data.data || []);
        setCurrentPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load notices:", err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Double-check date validation before submission
      if (form.publishAt && !validateDateTime(form.publishAt)) {
        alert("Publish date must be in the future");
        setForm({ ...form, publishAt: "" });
        return;
      }
      
      await createNotice(form);
      setForm({ title: "", description: "", category: "", publishAt: "" });
      loadNotices(currentPage);
    } catch (err) {
      console.error("Failed to create notice:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteNotice(id);
        loadNotices(currentPage);
      } catch (err) {
        console.error("Failed to delete notice:", err);
      }
    }
  };

  const startEdit = (notice) => {
    setEditingId(notice.id);
    setEditForm({
      title: notice.title,
      description: notice.description,
      category: notice.category,
      publishAt: notice.publishAt
        ? new Date(notice.publishAt).toISOString().slice(0, 16)
        : "",
      isPublished: notice.isPublished || false,
    });
  };

  const handleUpdate = async (id) => {
    try {
      // Double-check date validation before submission
      if (editForm.publishAt && !validateDateTime(editForm.publishAt)) {
        alert("Publish date must be in the future");
        setEditForm({ ...editForm, publishAt: "" });
        return;
      }
      
      setUpdating(true);
      await updateNotice(id, editForm);
      setEditingId(null);
      setEditForm({
        title: "",
        description: "",
        category: "",
        publishAt: "",
        isPublished: false,
      });
      loadNotices(currentPage);
    } catch (err) {
      console.error("Failed to update notice:", err);
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: "",
      description: "",
      category: "",
      publishAt: "",
      isPublished: false,
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredNotices = (notices || []).filter(
    (notice) =>
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg shadow">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-blue-100 mt-1">
                Manage notices and announcements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Notice Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 sticky top-8 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Create New Notice
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter notice title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-blue-500" />
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28 resize-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    Publish At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.publishAt}
                    onChange={(e) => {
                      if (validateDateTime(e.target.value)) {
                        setForm({ ...form, publishAt: e.target.value });
                      } else {
                        alert("Publish date must be in the future");
                        setForm({ ...form, publishAt: "" });
                      }
                    }}
                    min={getMinDateTime()}
                    onKeyDown={handleDateTimeKeyDown}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create Notice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notices Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      All Notices
                    </h2>
                  </div>
                  <span className="text-sm font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                    {total} total
                  </span>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search notices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto p-4 bg-blue-50 rounded-full w-max mb-4">
                    <Bell className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No notices found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm
                      ? "Try a different search term"
                      : "Create your first notice using the form"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="hidden md:block bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      <div
                        key={notice.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                      >
                        {editingId === notice.id ? (
                          /* Edit Form */
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                              placeholder="Title"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={editForm.category}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    category: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                                placeholder="Category"
                              />
                              <input
                                type="datetime-local"
                                value={editForm.publishAt}
                                onChange={(e) => {
                                  if (validateDateTime(e.target.value)) {
                                    setEditForm({
                                      ...editForm,
                                      publishAt: e.target.value,
                                    });
                                  } else {
                                    alert("Publish date must be in the future");
                                    setEditForm({ ...editForm, publishAt: "" });
                                  }
                                }}
                                min={getMinDateTime()}
                                onKeyDown={handleDateTimeKeyDown}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                              />
                            </div>
                            <textarea
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-24 resize-none transition-all duration-200"
                              placeholder="Description"
                            />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`published-${notice.id}`}
                                  checked={editForm.isPublished}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      isPublished: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                                />
                                <label
                                  htmlFor={`published-${notice.id}`}
                                  className="text-sm font-medium text-gray-700"
                                >
                                  Published
                                </label>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdate(notice.id)}
                                  disabled={updating}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                >
                                  {updating ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  ) : (
                                    <Save className="h-3 w-3" />
                                  )}
                                  <span>{updating ? "Saving..." : "Save"}</span>
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  disabled={updating}
                                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-3 md:space-y-0">
                            {/* Title */}
                            <div className="md:col-span-3">
                              <h4 className="font-medium text-gray-900 text-sm flex items-center">
                                <FileText className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{notice.title}</span>
                              </h4>
                              <div className="md:hidden text-xs text-gray-500 mt-1 flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                {formatDate(notice.createdAt)}
                              </div>
                            </div>

                            {/* Category */}
                            <div className="md:col-span-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Tag className="h-3 w-3 mr-1" />
                                {notice.category}
                              </span>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-3">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notice.description}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2">
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-1">
                                  {notice.isPublished ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Published
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Draft
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 hidden md:flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                  {formatDate(notice.publishAt)}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2">
                              <div className="flex flex-wrap gap-2 justify-end md:justify-start">
                                <button
                                  onClick={() => startEdit(notice)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(notice.id)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="text-sm text-gray-600">
                        Showing page{" "}
                        <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span> (
                        {total} total notices)
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex items-center px-3.5 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </button>

                        {/* Page numbers */}
                        <div className="hidden sm:flex items-center space-x-1">
                          {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, i) => {
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
                                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    pageNum === currentPage
                                      ? "bg-blue-600 text-white shadow-md"
                                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="inline-flex items-center px-3.5 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
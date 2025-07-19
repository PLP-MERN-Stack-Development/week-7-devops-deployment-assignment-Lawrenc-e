import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBugContext } from '../context/BugContext';
import { ArrowLeft, Edit, Trash2, Calendar, User, Tag, Clock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBug, loading, fetchBugById, deleteBug } = useBugContext();

  useEffect(() => {
    if (id) {
      fetchBugById(id);
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      await deleteBug(id);
      navigate('/bugs');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'open': 'badge-open',
      'in-progress': 'badge-in-progress',
      'resolved': 'badge-resolved',
      'closed': 'badge-closed'
    };
    return `badge ${classes[status] || 'badge-open'}`;
  };

  const getSeverityBadgeClass = (severity) => {
    const classes = {
      'critical': 'badge-critical',
      'high': 'badge-high',
      'medium': 'badge-medium',
      'low': 'badge-low'
    };
    return `badge ${classes[severity] || 'badge-medium'}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentBug) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bug not found</h2>
        <p className="text-gray-600 mb-4">The bug you're looking for doesn't exist.</p>
        <Link to="/bugs" className="btn-primary">
          Back to Bug List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentBug.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={getStatusBadgeClass(currentBug.status)}>
                {currentBug.status.replace('-', ' ')}
              </span>
              <span className={getSeverityBadgeClass(currentBug.severity)}>
                {currentBug.severity}
              </span>
              <span className="badge bg-gray-100 text-gray-800">
                {currentBug.priority} priority
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/bugs/${currentBug._id}/edit`}
            className="btn-secondary inline-flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger inline-flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{currentBug.description}</p>
          </div>

          {currentBug.stepsToReproduce && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Steps to Reproduce</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{currentBug.stepsToReproduce}</p>
            </div>
          )}

          {currentBug.expectedBehavior && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Behavior</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{currentBug.expectedBehavior}</p>
            </div>
          )}

          {currentBug.actualBehavior && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actual Behavior</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{currentBug.actualBehavior}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bug Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Reported by</p>
                  <p className="text-sm text-gray-600">{currentBug.reportedBy}</p>
                </div>
              </div>

              {currentBug.assignedTo && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assigned to</p>
                    <p className="text-sm text-gray-600">{currentBug.assignedTo}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">{formatDate(currentBug.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Last updated</p>
                  <p className="text-sm text-gray-600">{formatDate(currentBug.updatedAt)}</p>
                </div>
              </div>

              {currentBug.ageInDays !== undefined && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Age</p>
                    <p className="text-sm text-gray-600">
                      {currentBug.ageInDays} {currentBug.ageInDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentBug.tags && currentBug.tags.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {currentBug.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugDetail;
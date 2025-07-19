import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Calendar, User, Tag } from 'lucide-react';

const BugCard = ({ bug, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={getStatusBadgeClass(bug.status)}>
              {bug.status.replace('-', ' ')}
            </span>
            <span className={getSeverityBadgeClass(bug.severity)}>
              {bug.severity}
            </span>
            <span className="badge bg-gray-100 text-gray-800">
              {bug.priority} priority
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link
              to={`/bugs/${bug._id}`}
              className="hover:text-primary-600 transition-colors"
            >
              {bug.title}
            </Link>
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-2">
            {bug.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Reported by {bug.reportedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(bug.createdAt)}</span>
            </div>
            {bug.assignedTo && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>Assigned to {bug.assignedTo}</span>
              </div>
            )}
          </div>

          {bug.tags && bug.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {bug.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Link
            to={`/bugs/${bug._id}`}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={`/bugs/${bug._id}/edit`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Bug"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(bug._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Bug"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BugCard;
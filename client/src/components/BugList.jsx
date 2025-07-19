import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBugContext } from '../context/BugContext';
import { Plus, Filter, Search, Eye, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import BugCard from './BugCard';
import Pagination from './Pagination';

const BugList = () => {
  const {
    bugs,
    loading,
    pagination,
    filters,
    fetchBugs,
    deleteBug,
    setFilters
  } = useBugContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {
      status: searchParams.get('status') || '',
      severity: searchParams.get('severity') || '',
      priority: searchParams.get('priority') || ''
    };
    setFilters(urlFilters);
    fetchBugs(1, urlFilters);
  }, [searchParams]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newSearchParams.set(key, val);
    });
    setSearchParams(newSearchParams);
    
    fetchBugs(1, newFilters);
  };

  const handlePageChange = (page) => {
    fetchBugs(page, filters);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      await deleteBug(id);
      fetchBugs(pagination.currentPage, filters);
    }
  };

  const filteredBugs = bugs.filter(bug =>
    bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bug.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && bugs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bug Reports</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} total bugs found
          </p>
        </div>
        <Link to="/bugs/new" className="btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Report New Bug
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary inline-flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="form-select"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="form-select"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bug List */}
      {filteredBugs.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(f => f)
              ? 'Try adjusting your search or filters'
              : 'Get started by reporting your first bug'
            }
          </p>
          {!searchTerm && !Object.values(filters).some(f => f) && (
            <Link to="/bugs/new" className="btn-primary inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Report First Bug
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBugs.map((bug) => (
            <BugCard
              key={bug._id}
              bug={bug}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BugList;
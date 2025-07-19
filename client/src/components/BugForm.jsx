import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useBugContext } from '../context/BugContext';
import { Save, ArrowLeft } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const BugForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const { currentBug, loading, createBug, updateBug, fetchBugById } = useBugContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      severity: 'medium',
      priority: 'medium',
      status: 'open',
      reportedBy: '',
      assignedTo: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      tags: ''
    }
  });

  // Fetch bug data for editing
  useEffect(() => {
    if (isEditing && id) {
      fetchBugById(id);
    }
  }, [isEditing, id]);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && currentBug) {
      reset({
        title: currentBug.title || '',
        description: currentBug.description || '',
        severity: currentBug.severity || 'medium',
        priority: currentBug.priority || 'medium',
        status: currentBug.status || 'open',
        reportedBy: currentBug.reportedBy || '',
        assignedTo: currentBug.assignedTo || '',
        stepsToReproduce: currentBug.stepsToReproduce || '',
        expectedBehavior: currentBug.expectedBehavior || '',
        actualBehavior: currentBug.actualBehavior || '',
        tags: currentBug.tags ? currentBug.tags.join(', ') : ''
      });
    }
  }, [isEditing, currentBug, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Process tags
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      if (isEditing) {
        await updateBug(id, processedData);
      } else {
        await createBug(processedData);
      }

      navigate('/bugs');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && isEditing) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Bug Report' : 'Report New Bug'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update the bug report details' : 'Provide detailed information about the bug'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bug Title *
              </label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                  maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
                })}
                className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Brief description of the bug"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity *
              </label>
              <select
                {...register('severity', { required: 'Severity is required' })}
                className={`form-select ${errors.severity ? 'border-red-500' : ''}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {errors.severity && (
                <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className={`form-select ${errors.priority ? 'border-red-500' : ''}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="form-select"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reported By *
              </label>
              <input
                type="text"
                {...register('reportedBy', {
                  required: 'Reporter name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className={`form-input ${errors.reportedBy ? 'border-red-500' : ''}`}
                placeholder="Your name"
              />
              {errors.reportedBy && (
                <p className="mt-1 text-sm text-red-600">{errors.reportedBy.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                {...register('assignedTo')}
                className="form-input"
                placeholder="Developer or team member"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                {...register('tags')}
                className="form-input"
                placeholder="frontend, api, authentication (comma-separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bug Description</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                })}
                rows={4}
                className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Detailed description of the bug"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Steps to Reproduce
              </label>
              <textarea
                {...register('stepsToReproduce')}
                rows={3}
                className="form-input"
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Behavior
              </label>
              <textarea
                {...register('expectedBehavior')}
                rows={2}
                className="form-input"
                placeholder="What should happen?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Behavior
              </label>
              <textarea
                {...register('actualBehavior')}
                rows={2}
                className="form-input"
                placeholder="What actually happens?"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary inline-flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Update Bug' : 'Create Bug'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BugForm;
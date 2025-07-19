import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { bugService } from '../services/bugService';
import toast from 'react-hot-toast';

const BugContext = createContext();

const initialState = {
  bugs: [],
  currentBug: null,
  stats: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    severity: '',
    priority: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  }
};

const bugReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_BUGS':
      return {
        ...state,
        bugs: action.payload.bugs,
        pagination: {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total
        },
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_BUG':
      return { ...state, currentBug: action.payload, loading: false };
    
    case 'ADD_BUG':
      return {
        ...state,
        bugs: [action.payload, ...state.bugs],
        loading: false
      };
    
    case 'UPDATE_BUG':
      return {
        ...state,
        bugs: state.bugs.map(bug =>
          bug._id === action.payload._id ? action.payload : bug
        ),
        currentBug: state.currentBug?._id === action.payload._id ? action.payload : state.currentBug,
        loading: false
      };
    
    case 'DELETE_BUG':
      return {
        ...state,
        bugs: state.bugs.filter(bug => bug._id !== action.payload),
        loading: false
      };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

export const BugProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bugReducer, initialState);

  // Debug logging
  const debugLog = (action, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[BugContext] ${action}:`, data);
    }
  };

  const fetchBugs = async (page = 1, filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      debugLog('Fetching bugs', { page, filters });
      
      const data = await bugService.getBugs(page, filters);
      dispatch({ type: 'SET_BUGS', payload: data });
      debugLog('Bugs fetched successfully', data);
    } catch (error) {
      debugLog('Error fetching bugs', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch bugs');
    }
  };

  const fetchBugById = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      debugLog('Fetching bug by ID', { id });
      
      const bug = await bugService.getBugById(id);
      dispatch({ type: 'SET_CURRENT_BUG', payload: bug });
      debugLog('Bug fetched successfully', bug);
    } catch (error) {
      debugLog('Error fetching bug', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch bug details');
    }
  };

  const createBug = async (bugData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      debugLog('Creating bug', bugData);
      
      const newBug = await bugService.createBug(bugData);
      dispatch({ type: 'ADD_BUG', payload: newBug });
      debugLog('Bug created successfully', newBug);
      toast.success('Bug created successfully');
      return newBug;
    } catch (error) {
      debugLog('Error creating bug', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to create bug');
      throw error;
    }
  };

  const updateBug = async (id, bugData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      debugLog('Updating bug', { id, bugData });
      
      const updatedBug = await bugService.updateBug(id, bugData);
      dispatch({ type: 'UPDATE_BUG', payload: updatedBug });
      debugLog('Bug updated successfully', updatedBug);
      toast.success('Bug updated successfully');
      return updatedBug;
    } catch (error) {
      debugLog('Error updating bug', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to update bug');
      throw error;
    }
  };

  const deleteBug = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      debugLog('Deleting bug', { id });
      
      await bugService.deleteBug(id);
      dispatch({ type: 'DELETE_BUG', payload: id });
      debugLog('Bug deleted successfully', { id });
      toast.success('Bug deleted successfully');
    } catch (error) {
      debugLog('Error deleting bug', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to delete bug');
    }
  };

  const fetchStats = async () => {
    try {
      debugLog('Fetching stats');
      const stats = await bugService.getStats();
      dispatch({ type: 'SET_STATS', payload: stats });
      debugLog('Stats fetched successfully', stats);
    } catch (error) {
      debugLog('Error fetching stats', error);
      console.error('Failed to fetch stats:', error);
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Fetch initial data
  useEffect(() => {
    fetchBugs();
    fetchStats();
  }, []);

  const value = {
    ...state,
    fetchBugs,
    fetchBugById,
    createBug,
    updateBug,
    deleteBug,
    fetchStats,
    setFilters,
    clearError
  };

  return (
    <BugContext.Provider value={value}>
      {children}
    </BugContext.Provider>
  );
};

export const useBugContext = () => {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error('useBugContext must be used within a BugProvider');
  }
  return context;
};
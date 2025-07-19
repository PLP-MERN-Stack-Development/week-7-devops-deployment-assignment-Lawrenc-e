import axios from 'axios';
import { bugService } from '../services/bugService';

jest.mock('axios');
const mockedAxios = axios;

describe('bugService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBugs', () => {
    it('should fetch bugs with default parameters', async () => {
      const mockResponse = {
        data: {
          bugs: [{ _id: '1', title: 'Test Bug' }],
          total: 1,
          currentPage: 1,
          totalPages: 1
        }
      };
      
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await bugService.getBugs();
      
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch bugs with filters', async () => {
      const mockResponse = {
        data: {
          bugs: [{ _id: '1', title: 'Test Bug', status: 'open' }],
          total: 1,
          currentPage: 1,
          totalPages: 1
        }
      };
      
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const filters = { status: 'open', severity: 'high' };
      await bugService.getBugs(2, filters);
      
      expect(mockGet).toHaveBeenCalledWith('/bugs', {
        params: { page: 2, limit: 10, ...filters }
      });
    });
  });

  describe('getBugById', () => {
    it('should fetch a single bug', async () => {
      const mockBug = { _id: '1', title: 'Test Bug' };
      const mockResponse = { data: mockBug };
      
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await bugService.getBugById('1');
      
      expect(mockGet).toHaveBeenCalledWith('/bugs/1');
      expect(result).toEqual(mockBug);
    });
  });

  describe('createBug', () => {
    it('should create a new bug', async () => {
      const bugData = {
        title: 'New Bug',
        description: 'Bug description',
        severity: 'high',
        reportedBy: 'Test User'
      };
      
      const mockResponse = { data: { _id: '1', ...bugData } };
      
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await bugService.createBug(bugData);
      
      expect(mockPost).toHaveBeenCalledWith('/bugs', bugData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateBug', () => {
    it('should update an existing bug', async () => {
      const bugData = { status: 'resolved' };
      const mockResponse = { data: { _id: '1', ...bugData } };
      
      const mockPut = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        put: mockPut,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await bugService.updateBug('1', bugData);
      
      expect(mockPut).toHaveBeenCalledWith('/bugs/1', bugData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteBug', () => {
    it('should delete a bug', async () => {
      const mockResponse = { data: { message: 'Bug deleted' } };
      
      const mockDelete = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        delete: mockDelete,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await bugService.deleteBug('1');
      
      expect(mockDelete).toHaveBeenCalledWith('/bugs/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getStats', () => {
    it('should fetch bug statistics', async () => {
      const mockStats = {
        total: 10,
        open: 5,
        inProgress: 2,
        resolved: 3,
        closed: 0
      };
      
      const mockResponse = { data: mockStats };
      
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const result = await bugService.getStats();
      
      expect(mockGet).toHaveBeenCalledWith('/bugs/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { message: 'Validation error' }
        }
      };
      
      const mockGet = jest.fn().mockRejectedValue(errorResponse);
      mockedAxios.create.mockReturnValue({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { 
            use: jest.fn((success, error) => {
              // Simulate the error interceptor
              return Promise.reject(new Error('Validation error'));
            })
          }
        }
      });

      await expect(bugService.getBugById('1')).rejects.toThrow('Validation error');
    });
  });
});
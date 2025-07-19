import { validateBugData, sanitizeBugData, calculateBugPriority } from '../utils/bugUtils.js';

describe('Bug Utils', () => {
  describe('validateBugData', () => {
    it('should return null for valid data', () => {
      const validData = {
        title: 'Valid Title',
        description: 'This is a valid description that is long enough',
        reportedBy: 'Valid Reporter'
      };

      const result = validateBugData(validData);
      expect(result).toBeNull();
    });

    it('should return error for short title', () => {
      const invalidData = {
        title: 'AB',
        description: 'Valid description that is long enough',
        reportedBy: 'Valid Reporter'
      };

      const result = validateBugData(invalidData);
      expect(result).toContain('Title must be at least 3 characters');
    });

    it('should return error for short description', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Short',
        reportedBy: 'Valid Reporter'
      };

      const result = validateBugData(invalidData);
      expect(result).toContain('Description must be at least 10 characters');
    });

    it('should return error for short reporter name', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Valid description that is long enough',
        reportedBy: 'A'
      };

      const result = validateBugData(invalidData);
      expect(result).toContain('Reporter name must be at least 2 characters');
    });
  });

  describe('sanitizeBugData', () => {
    it('should sanitize string fields', () => {
      const data = {
        title: '  Test Title  ',
        description: '  Test Description  ',
        reportedBy: '  Test Reporter  '
      };

      const result = sanitizeBugData(data);
      expect(result.title).toBe('Test Title');
      expect(result.description).toBe('Test Description');
      expect(result.reportedBy).toBe('Test Reporter');
    });

    it('should filter valid enum values', () => {
      const data = {
        severity: 'high',
        status: 'open',
        priority: 'medium',
        invalidField: 'invalid'
      };

      const result = sanitizeBugData(data);
      expect(result.severity).toBe('high');
      expect(result.status).toBe('open');
      expect(result.priority).toBe('medium');
      expect(result.invalidField).toBeUndefined();
    });

    it('should sanitize tags array', () => {
      const data = {
        tags: ['  tag1  ', 'tag2', '', '  tag3  ', 123]
      };

      const result = sanitizeBugData(data);
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should handle non-string values', () => {
      const data = {
        title: 123,
        description: null,
        reportedBy: undefined
      };

      const result = sanitizeBugData(data);
      expect(result.title).toBe('');
      expect(result.description).toBe('');
      expect(result.reportedBy).toBe('');
    });
  });

  describe('calculateBugPriority', () => {
    it('should calculate priority for critical severity', () => {
      const priority = calculateBugPriority('critical', 0);
      expect(priority).toBe(4);
    });

    it('should calculate priority with age factor', () => {
      const priority = calculateBugPriority('high', 7); // 1 week old
      expect(priority).toBe(4); // 3 (high) + 1 (age)
    });

    it('should cap age weight at 3 weeks', () => {
      const priority = calculateBugPriority('low', 30); // 30 days old
      expect(priority).toBe(4); // 1 (low) + 3 (max age weight)
    });
  });
});
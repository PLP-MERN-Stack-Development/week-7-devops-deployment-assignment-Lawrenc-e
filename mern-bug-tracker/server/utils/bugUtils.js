export const validateBugData = (data) => {
  const { title, description, reportedBy } = data;

  if (!title || title.trim().length < 3) {
    return 'Title must be at least 3 characters long';
  }

  if (!description || description.trim().length < 10) {
    return 'Description must be at least 10 characters long';
  }

  if (!reportedBy || reportedBy.trim().length < 2) {
    return 'Reporter name must be at least 2 characters long';
  }

  return null;
};

export const sanitizeBugData = (data) => {
  const sanitized = {};

  // Sanitize string fields
  const stringFields = ['title', 'description', 'reportedBy', 'assignedTo', 'stepsToReproduce', 'expectedBehavior', 'actualBehavior'];
  stringFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = typeof data[field] === 'string' ? data[field].trim() : '';
    }
  });

  // Sanitize enum fields
  const enumFields = {
    severity: ['low', 'medium', 'high', 'critical'],
    status: ['open', 'in-progress', 'resolved', 'closed'],
    priority: ['low', 'medium', 'high']
  };

  Object.keys(enumFields).forEach(field => {
    if (data[field] && enumFields[field].includes(data[field])) {
      sanitized[field] = data[field];
    }
  });

  // Sanitize tags array
  if (Array.isArray(data.tags)) {
    sanitized.tags = data.tags
      .filter(tag => typeof tag === 'string')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  return sanitized;
};

export const calculateBugPriority = (severity, ageInDays) => {
  const severityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const ageWeight = Math.min(ageInDays / 7, 3); // Max 3 weeks weight
  return severityWeight[severity] + ageWeight;
};
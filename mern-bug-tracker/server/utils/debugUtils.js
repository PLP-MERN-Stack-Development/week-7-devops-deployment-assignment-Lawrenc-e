export const debugLog = (message, data = {}) => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    if (Object.keys(data).length > 0) {
      console.log('[DEBUG] Data:', JSON.stringify(data, null, 2));
    }
  }
};

export const performanceLog = (label, startTime) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  debugLog(`Performance: ${label}`, { duration: `${duration}ms` });
};

export const memoryUsage = () => {
  const usage = process.memoryUsage();
  debugLog('Memory Usage', {
    rss: `${Math.round(usage.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(usage.external / 1024 / 1024 * 100) / 100} MB`
  });
};
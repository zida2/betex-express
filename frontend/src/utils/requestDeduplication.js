/**
 * Request Deduplication Utility
 * Prevents duplicate simultaneous requests
 */

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * Execute function with deduplication
   * @param {string} key - Unique identifier for the request
   * @param {Function} fn - Async function to execute
   * @returns {Promise}
   */
  async execute(key, fn) {
    // Return existing pending request
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request promise
    const promise = fn()
      .then(result => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear();
  }

  /**
   * Clear specific request
   */
  clearKey(key) {
    this.pendingRequests.delete(key);
  }

  /**
   * Get pending request count
   */
  getPendingCount() {
    return this.pendingRequests.size;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Debounce utility for search/filter inputs
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId = null;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Throttle utility for frequent events
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
export const throttle = (fn, delay = 300) => {
  let lastCall = 0;
  let timeoutId = null;

  return (...args) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      fn(...args);
      lastCall = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
        lastCall = Date.now();
      }, delay - (now - lastCall));
    }
  };
};

// Mock storage API using localStorage
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        throw new Error('Key not found');
      }
      return { key, value };
    } catch (error) {
      throw error;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (error) {
      return null;
    }
  }
};

// Make it available globally
window.storage = storage;
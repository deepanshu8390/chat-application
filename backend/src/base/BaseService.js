class BaseService {
  constructor({ repository } = {}) {
    if (new.target === BaseService) {
      throw new Error("BaseService is abstract and cannot be instantiated directly.");
    }
    this.repository = repository;
  }
}

module.exports = { BaseService };

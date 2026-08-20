const { BaseService } = require("../base/BaseService.js");

class UserService extends BaseService {
  constructor({ repository } = {}) {
    super({ repository });
  }

  async listUsers(currentUserId) {
    this.#validateCurrentUserId(currentUserId);
    return this.#listOtherUsers(currentUserId);
  }

  #validateCurrentUserId(currentUserId) {
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
  }

  async #listOtherUsers(currentUserId) {
    return this.repository.listOtherUsers(currentUserId);
  }
}

module.exports = { UserService };

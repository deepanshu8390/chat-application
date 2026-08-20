const { BaseRepository } = require("../base/BaseRepository.js");

class UserRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  findByEmail() {
    throw new Error("findByEmail() must be implemented by a concrete repository.");
  }

  findById() {
    throw new Error("findById() must be implemented by a concrete repository.");
  }

  findByResetToken() {
    throw new Error("findByResetToken() must be implemented by a concrete repository.");
  }

  findByEmailAndResetToken() {
    throw new Error("findByEmailAndResetToken() must be implemented by a concrete repository.");
  }

  listOtherUsers() {
    throw new Error("listOtherUsers() must be implemented by a concrete repository.");
  }

  create() {
    throw new Error("create() must be implemented by a concrete repository.");
  }

  save() {
    throw new Error("save() must be implemented by a concrete repository.");
  }
}

module.exports = { UserRepository };

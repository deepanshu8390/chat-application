const { UserRepository } = require("./UserRepository.js");

class MongoUserRepository extends UserRepository {
  constructor(model) {
    super(model);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findByResetToken(token) {
    return this.model.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });
  }

  async findByEmailAndResetToken(email, token) {
    return this.model.findOne({
      email,
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });
  }

  async listOtherUsers(currentUserId) {
    return this.model
      .find({ _id: { $ne: currentUserId } })
      .select("-password -resetToken -resetExpires");
  }

  async create(data) {
    return this.model.create(data);
  }

  async save(entity) {
    return entity.save();
  }
}

module.exports = { MongoUserRepository };

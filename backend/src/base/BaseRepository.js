class BaseRepository {
  constructor(model) {
    if (new.target === BaseRepository) {
      throw new Error("BaseRepository is abstract and cannot be instantiated directly.");
    }
    this.model = model;
  }
}

module.exports = { BaseRepository };

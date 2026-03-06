const { User } = require('../models');

class UserRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findUserByUsername(username) {
    return await User.findOne({ where: { username } });
  }

  async findUserById(id) {
    return await User.findByPk(id);
  }

  async updateUser(userId, data) {
    return await User.update(data, {
      where: { id: userId },
      returning: true,
      plain: true
    });
  }
}

module.exports = new UserRepository();

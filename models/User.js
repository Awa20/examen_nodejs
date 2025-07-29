const db = require('./db');

const User = {
  getAll: () => db.promise().query('SELECT * FROM users'),
  getById: (id) => db.promise().query('SELECT * FROM users WHERE id = ?', [id]),
  getByUsername: (username) => db.promise().query('SELECT * FROM users WHERE username = ?', [username]),

  
  create: (data) => db.promise().query(
    'INSERT INTO users (name, username, password,role) VALUES (?, ?, ?,?)',
    [data.name, data.username, data.password,data.role]
  ),

  update: (id, data) => db.promise().query(
    'UPDATE users SET name=?, username=?,role=? WHERE id=?',
    [data.name, data.username, data.role,id]
  ),

  delete: (id) => db.promise().query('DELETE FROM users WHERE id = ?', [id]),
};

module.exports = User;

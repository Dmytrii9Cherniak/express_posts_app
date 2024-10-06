const Post = require('./models/Post');
const Comment = require('./models/Comment');
const User = require('./models/User');
const Token = require('./models/Token');

Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });

Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = { Post, Comment, User };

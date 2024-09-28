const Post = require('./models/Post');
const Comment = require('./models/Comment');
const User = require('./models/User');

// Встановлюємо зв'язок між постами і користувачами
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Встановлюємо зв'язок між постами і коментарями
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });

// Встановлюємо зв'язок між коментарями і постами та користувачами
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

module.exports = { Post, Comment, User };

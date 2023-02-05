const router = require('express').Router();
const { User, Post, Comment } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', (req, res) => {
  try {
  Post.findAll({
    attributes: [
      'id',
      'title',
      'content',
      'created_at'
    ],
    include: [
      {
          model: Comment,
          attributes: ['id', 'comment_input', 'post_id', 'user_id', 'created_at'],
          include: {
            model: User,
            attribute: ['name']
          }
      },
      {
        model: User,
        attributes: ['name']
      }
    ]
  }).then(postData => {
    const renderPosts = postData.map(post => post.get({ plain: true }));
    res.render('homepage', {renderPosts, logged_in: req.session.logged_in});
  }) 
} catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/profile', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
    });

    const user = userData.get({ plain: true });

    res.render('profile', {
      ...user,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('login');
});

router.get('/signup', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('signup');
});

router.get('/post/:id', (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    attributes: [
      'id',
      'title',
      'created_at',
      'content'
    ],
    include: [
      {
          model: Comment,
          attributes: ['id', 'entry', 'post_id', 'user_id', 'created_at'],
          include: {
            model: User,
            attribute: ['name']
          }
      },
      {
        model: User,
        attributes: ['name']
      }
    ]
  }) .then(postData => {
    if(!postData) {
      res.status(404).json({ message: 'Not able to find a post with that ID'})
      return;
    }
  });
});


module.exports = router;

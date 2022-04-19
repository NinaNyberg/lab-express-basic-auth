/* eslint-disable prettier/prettier */
const express = require('express');
const router = new express.Router();
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  const { fullname, username, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then((passwordHashAndSalt) => {
      return User.create({
        fullname,
        username,
        passwordHashAndSalt
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      res.redirect('/private');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  const { fullname, username, password } = req.body;
  let user;
  User.findOne({ username })
    .then((found) => {
      user = found;
      if (user === null) {
        throw new Error('There is no user with that username.');
      } else {
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        res.redirect('/private');
      } else {
        throw new Error('Wrong password');
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/edit', (req, res, next) => {
  const { id } = req.params;
  User.findOne(id)
    .then((user) => {
      res.render('edit', { user });
    })
    .catch((error) => {
      console.log('Failed to edit', error);
      next(error);
    });
});

router.post('/edit', (req, res, next) => {
  const { id } = req.params;
  const { fullname, username, password } = req.body;
  User.findOneAndUpdate(id, { fullname })
    .then(() => {
      res.redirect('/profile');
    })
    .catch((error) => {
      console.log('There was an error updating the profile.');
      next(error);
    });
});

const routeGuard = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    next(new Error('User is not authenticated'));
    // res.redirect("/login")
  }
};

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

router.get('/main', routeGuard, (req, res, next) => {
  res.render('main');
});

router.get('/profile', routeGuard, (req, res, next) => {
  res.render('profile');
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;

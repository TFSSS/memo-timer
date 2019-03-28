'use strict';
const express = require('express');
const router = express.Router();
const Transcription = require('../models/transcription');
const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = '発表練習くん';
  if(req.user){
    Transcription.findAll({
      include: [
        {
          model: User,
          attributes: ['userId', 'username']
        }
      ],
      where: {
        createdBy: req.user.id
      },
      order: [["updatedAt", 'DESC']]
    }).then((transcriptions) => {
      res.render('index', {
        title: title,
        user: req.user,
        transcriptions: transcriptions
      });
    });
  }else{
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;
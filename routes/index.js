'use strict';
const express = require('express');
const router = express.Router();
const Transcription = require('../models/transcription');

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = '発表練習くん';
  if(req.user){
    Transcription.findAll({
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
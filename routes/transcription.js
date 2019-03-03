'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Transcription = require('../models/transcription');
const Memo = require('../models/memo');

router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new',{ user: req.user });
});

router.post('/', authenticationEnsurer, (req, res, next) => {
  const transcriptionId = uuid.v4();
  const updatedAt = new Date();
  Transcription.create({
    transcriptionId: transcriptionId,
    transcriptionName: req.body.transcriptionName,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((transcription) => {
    res.redirect('/transcriptions/' + transcription.transcriptionId);
  });
});

module.exports = router;
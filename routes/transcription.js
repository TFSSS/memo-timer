'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const User = require('../models/user');
const Transcription = require('../models/transcription');
const Memo = require('../models/memo');
const csrf = require('csurf');
const csrfProtection = csrf({cookie:true});

/**
 * 原稿の新規作成画面
 */
router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new',{title: '新規作成', user: req.user });
});

/**
 * 原稿の再生/編集画面
 */
router.get('/:transcriptionId', authenticationEnsurer, (req, res, next) => {
  res.render('transcription',{title: '原稿', user: req.user, transcriptionId: req.params.transcriptionId});
});

/**
 * 原稿の編集画面
 */
router.get('/:transcriptionId/edit', authenticationEnsurer, (req, res, next) => {
  //編集画面は本人だけが開ける
  const transcriptionId = req.params.transcriptionId;
  Memo.findAll({
    include: [
      {
      model: Transcription,
      attributes: ['transcriptionId','createdBy']
      }
    ]
    ,where: {
      transcriptionId: transcriptionId
    }
    ,order:[["order","ASC"]]
  }).then((memos) => {
    res.render('edit',{title: '編集', user: req.user,transcriptionId: transcriptionId, memos: memos});
  });
});

/**
 * メモの新規作成画面
 */
router.get('/:transcriptionId/edit/new', authenticationEnsurer, (req, res, next) => {
  const transcriptionId = req.params.transcriptionId;
  res.render('new-memo',{title: '新しいメモ', user: req.user, transcriptionId: transcriptionId});
});

/**
 * メモの編集画面を表示する
 */
router.get('/:transcriptionId/edit/:candidateId', authenticationEnsurer, (req, res, next) => {
  const transcriptionId = req.params.transcriptionId;
  const candidateId = req.params.candidateId;
  Memo.findOne({
    where: {candidateId: candidateId}
  }).then((memo) => {
    res.render('edit-memo',{title: 'メモの編集', memo: memo});
  });
});

/**
 * 発表原稿の再生画面を表示する
 */
router.get('/:transcriptionId/play', authenticationEnsurer, (req, res, next) => {
  const transcriptionId = req.params.transcriptionId;

  Memo.findAll({
    where: {transcriptionId: transcriptionId}
  }).then((memos) => {
    res.render('play',{title: '再生', memos: memos}); 
  });
});

/**
 * 新しい原稿を作成した時の処理
 */
router.post('/', authenticationEnsurer, (req, res, next) => {
  const transcriptionId = uuid.v4();
  const candidateId = uuid.v4();
  const updatedAt = new Date();
  Transcription.create({
    transcriptionId: transcriptionId,
    transcriptionName: req.body.transcriptionName,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((transcription) => {
    Memo.create({
      candidateId: candidateId,
      transcriptionId: transcriptionId,
      userId: req.user.id,
      content: 'ここに内容を記入してください',
      time: 60,
      order: 1
    });
    res.redirect('/');
  });
});

/**
 * 新しいメモを作成した時の処理
 *  TranscriptionのupdatedAtを更新し，新しいMemoを作成する
 */
router.post('/:transcriptionId/edit/new', authenticationEnsurer, (req, res, next) => {
  const transcriptionId = req.params.transcriptionId;
  const content = req.body.content;
  const time = req.body.time;
  const order = req.body.order;
  const candidateId = uuid.v4();
  const updatedAt = new Date();
  Transcription.findOne({
    where: {
      transcriptionId: transcriptionId
    }
  }).then((transcription) => {
    if(isMine(req, transcription)){
    //原稿の作成者とリクエストしたユーザーが同じ時の処理
      Transcription.update({
        transcriptionId: transcriptionId,
        transcriptionName: transcription.transcriptionName,
        createdBy: transcription.createdBy,
        updatedAt: updatedAt
      },
      {
        where: {transcriptionId: transcriptionId}
      }).then(() => {
        Memo.create({
          candidateId: candidateId,
          userId: req.user.id,
          transcriptionId: transcriptionId,
          content: content,
          time: time,
          order: order
        });
      }).then(() => {
        res.redirect('/transcriptions/' + transcriptionId);
      });
    }else{
    //原稿の作成者とリクエストしたユーザーが違う時の処理
    const err = new Error('編集する権限がありません');
    err.status = 404;
    next(err);
    }
  });
});

/**
 * 既存のメモを編集した時の処理
 * transcriptionのupdatedAtの更新
 * Memoの更新
 */
router.post('/:transcriptionId/edit/:candidateId',(req, res, next)=> {
  const transcriptionId = req.params.transcriptionId;
  const candidateId = req.params.candidateId;
  const updatedAt = new Date();
  const content = req.body.content;
  const time = req.body.time;
  const order = req.body.order;

  Transcription.findOne({
    where: {
      transcriptionId: transcriptionId
    }
  }).then((transcription) => {
    if(isMine(req, transcription)){
      Transcription.update({
        transcriptionId: transcriptionId,
        transcriptionName: transcription.transcriptionName,
        createdBy: transcription.createdBy,
        updatedAt: transcription.updatedAt
      },{
        where: {transcriptionId: transcriptionId}
      }).then((transcription) => {
        Memo.findOne({
          where: {
            candidateId: candidateId
          }
        }).then((memo) => {
          Memo.update({
            candidateId: memo.candidateId,
            userId: req.user.id,
            transcriptionId: memo.transcriptionId,
            content: content,
            time: time,
            order: order
          },{
            where: {candidateId: candidateId}
          }).then(() => {
            res.redirect('/transcriptions/' + transcriptionId + '/edit');
          });
        });
      });
    }else{
      const err = new Error();
      err.status = 404;
      next(err);
    }
  });
});

/**
 * 削除する時の処理
 */
router.post('/:transcriptionId/edit/:candidateId/delete',(req, res, next) => {
  const transcriptionId = req.params.transcriptionId;
  const candidateId = req.params.candidateId;
  const updatedAt = new Date();

  Transcription.findOne({
    where: {
      transcriptionId: transcriptionId
    }
  }).then((transcription) => {
    Transcription.update({
      transcriptionId: transcriptionId,
      transcriptionName: transcription.transcriptionName,
      createdBy: transcription.createdBy,
      updatedAt: updatedAt
    },
    {
      where: {transcriptionId: transcriptionId}
    })
  }).then(() => {
    Memo.destroy({
      where: {
        candidateId: candidateId
      }
    });
  }).then(() => {
    res.redirect('/transcriptions/' + transcriptionId + '/edit');
  });
});

//原稿を再生する時の処理
router.post('/:transcriptionId/play', (req, res, next) => {
  var transcriptionId = req.params.transcriptionId;
  Memo.findAll({
    where: {
      transcriptionId: transcriptionId
    }
    ,order:[["order","ASC"]]
  }).then((transcription) => {
    res.json(transcription);
  });
});

function isMine(req, transcription){
  return transcription && parseInt(transcription.createdBy) === parseInt(req.user.id);
};

module.exports = router;
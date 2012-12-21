var winston = require('winston');
var rest = require('restler');
var hashish = require('hashish');
var async = require('async');
var fs = require('fs');
var grade = require('../lib/grader');
var rubrics = require('../lib/rubrics');
var db = require('../config').db;

var Controller = module.exports = {};

var allRubrics = {};
Object.keys(rubrics).forEach(function(k){
  allRubrics[k] = rubrics[k].json;
});



Controller.gradeRequest = function(req, res, next) {
  winston.info('grading a CCD request of length ' + req.rawBody.length);
  grade(req.rawBody, function(err, report){
    res.json(report);
  });
};

Controller.rubricOne = function(req, res, next) {
  winston.info('getting one rubric: ' + req.params);
  res.json(allRubrics[req.params.rid]);
};

Controller.rubricAll = function(req, res, next) {
  winston.info('getting all rubrics');
  res.json(allRubrics);
};


function allStats(done){
  db.ccdaScorecard.collection("scoreStats", function(err, stats){
    if (err){ 
      return next(err); 
    }

    stats.find({}).toArray(function(err, allstats){
      if (err) {
        return next(err);
      }
      var ret = {};
      allstats.forEach(function(s){
        s.id = s._id;
        delete s._id;
        ret[s.id] = s;
      });
      done(err, ret);
    });
  });
};

Controller.statsAll = function(req, res, next) {
  winston.info('getting scorecard stats');
  allStats(function(err, stats){
    res.json(stats);
  })
};

Controller.statsOne = function(req, res, next) {
  winston.info('getting scorecard stats');
  allStats(function(err, stats){
    res.json(stats[req.params.rid]);
  })
};


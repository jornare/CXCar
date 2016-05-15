
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'CXCar' });
};

exports.menu = function(req, res){
  res.render('menu', { });
};

exports.player = function(req, res){
  res.render('player', {  });
};

exports.raffle = function(req, res){
  res.render('raffle', {  });
};

exports.game = function(req, res){
  res.render('game', {  });
};

exports.highscores = function(req, res){
  res.render('highscores', { });
};
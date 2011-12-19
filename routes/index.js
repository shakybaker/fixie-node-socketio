exports.home = function(req, res){
  res.render('home', { title: 'Fixie: Home' })
};

exports.board = function(req, res){
  if (req.loggedIn) {
    res.render('board', { title: 'Fixie: Board' })
  } else {
    res.redirect('/')
  }
};

//exports.login = function(req, res){
//  res.render('login', { title: 'Login' })
//};

/* GET home page. */
exports.index = function(req, res){
  res.render('index', { title: 'Vrakatar World' });
};
/* GET vrak page. */
exports.vrak = function(req, res){
  res.render('vrak', { title: 'Vrak' });
};

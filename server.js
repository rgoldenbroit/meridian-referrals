// ReferralHub intake service
// Integration Engineering, 2014. Last major change: 2019.
var app = require('./app');
var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('ReferralHub intake listening on port ' + port);
});

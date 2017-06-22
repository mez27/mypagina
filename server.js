var express         = require('express'),
    multer          = require('multer');
var password        = "123456789";
var app            = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.use(express.static("public"));
app.set("view engine","pug");


/*
 * VIEWS CALLS
 */
app.get("/",function(req,res){
  res.render("index");
});

app.get("/admin", function(req,res){
   res.render("admin/form");
});



app.listen(port, ip);

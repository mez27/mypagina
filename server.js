var express         = require('express'),
    multer          = require('multer');
var password        = "123456789";
var app            = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

var db = null,
    dbDetails = new Object();

//var initDb = function(callback) {
  if (mongoURL == null) return;

var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
//};

/* Definicion el schema de nuestros productos
 * estructura de los productos
 */
var productosSchemaJson={
  title:String,
  description:String,
  imageUrl:String
};

var Schema = mongodb.Schema;
var productsSchema = new Schema(productosSchemaJson);

productsSchema.virtual("imageDefault").get(function(){
  if(this.imageUrl === "" || this.imageUrl === "data.jpg"){
    return "data.jpg";
  }
  return this.imageUrl;
});

//modelo
var Product = mongodb.model("Product", productsSchema);

var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./uploads");
     },
     filename: function(req, file, callback) {
         callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
     }
});

cloudinary.config({
  cloud_name: "mez",
  api_key: "715786556537535",
  api_secret: "OqXULcM8FOCe8a5naHwmQQQu8_Q"
});


app.use(multer({storage: Storage}).any());
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


/*
 * aqui llegamos de la pagina de administracion despues
 * que hemos dado el pas de administrador y nos redirige
 * donde pogramos ver y modificar nuestros elementos
 * 
 */
app.post("/admin", function(req,res){

  if(req.body.password == password) {
  Product.find(function(error,document){
    if(error){console.log(error)}
    res.render("admin/index",{ products: document});
  });
  }else{
    res.render("index");
  }
});

app.listen(port, ip);

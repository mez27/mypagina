var express         = require('express'),
    //mongoose        = require('mongoose'),
    bodyParser      = require('body-parser'),
    multer          = require('multer'),
    cloudinary      = require('cloudinary'),
    method_override = require('method-override');
    password = "123456789";
    app = express();
    //Schema = mongoose.Schema;

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

var initDb = function(callback) {
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
};

/* Definicion el schema de nuestros productos
 * estructura de los productos
 */
var productosSchemaJson={
  title:String,
  description:String,
  imageUrl:String
};
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


//mongoose.connect("mongodb://localhost/primera_pagina");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({storage: Storage}).any());
app.use(method_override("_method"));
app.use(express.static("public"));
app.set("view engine","pug");


/*
 * VIEWS CALLS
 */
app.get("/",function(req,res){
  res.render("index");
});

app.get("/load",function(req,res){
  res.render("menu/new");
});

app.get("/admin", function(req,res){
   res.render("admin/form");
});

app.get("/pelisfavoritas",function(req,res){
  Product.find(function(error,document){
    if(error){console.log(error)}
    res.render("menu/pelisfavoritas",{ products: document});
  })
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

/*
 * Aqui estamos creando los elementos que estan
 * ciendo mandados de la pagina. Solo es posible si
 * la contrasena es la del administrador 
 */
app.post("/menu", function(req,res){

  if(req.body.password == password) {

    var data = {
      title: req.body.title,
      description: req.body.description,
      imageUrl: "",
      password: req.body.password
    }

    var product = new Product(data);

    cloudinary.uploader.upload(req.files[0].path,
      function(result) { 
        product.imageUrl = result.url;
        product.save(function(err){
          res.redirect("/pelisfavoritas");
        });
      });

  } else {
    res.redirect("/pelisfavoritas");
  }
});

/*
 * aqui estamos pasando el id del elemento para
 * encontrarlo en la DB y luego se llama a la
 * vista para hacer las modificationes.
 * esta es llamada luego que se aya echo la 
 * verification del administrador
 */
app.get("/menu/edit/:id",function(req,res){
  var id_prod = req.params.id;

  Product.findOne({"_id":id_prod},function(err,product1){
    console.log(product1);
    res.render("menu/edit",{ producto: product1 });
  });
});

/*
 * aqui estamos cambiando los datos de los elementos que 
 * ya esta en la DB
 */
app.put("/save/:id",function(req,res){
  if (req.body.password == password) {
    var data = {
      title: req.body.title,
      description: req.body.description,
          imageUrl: req.body.imageUrl
    };$
    Product.update({"_id": req.params.id},data,function(){
      res.redirect("/pelisfavoritas");
    });

  }else{
    res.redirect("/");
  }
});

/*
 * Proceso de eliminacion
 * Metodo que ejecuta la pagina donde se hace la autenticacion
 * para borrar los elementos
 */
app.get("/menu/:id/delete",function(req,res){
  var id = req.params.id;
  Product.findOne({"_id": id},function(err, producto){
    res.render("menu/delete",{producto:producto})
  });
});

/*
 * Metodo que borra el elemento y
 * luego redirectiona a la mis pelicula favoritas
 */
app.delete("/remove/:id",function(req,res){
  var id = req.params.id;
  //console.log("delete"+id)
  if (req.body.password == password) {
    Product.remove({"_id": id},function(err){
      if (err) {console.log(err);}
      res.redirect("/");
    });
  }else{
    res.redirect("/");
  }
});
app.listen(port, ip);
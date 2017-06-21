npm install chai --save
npm install chai-http --save
npm install ejs --save
npm install express --save
npm install mocha --save
npm install mongodb --save
npm install morgan --save
npm install object-assign --save
npm install body-parser --save
npm install cloudinary --save
npm install method-override --save
npm install multer --save
npm install node --save
npm install pug --save


git add .
git commit -am "cambios 3"
git push https://github.com/mez27/mypagina.git master


/Applications/oc login https://api.starter-us-west-2.openshift.com
/Applications/oc project mez-co
/Applications/oc status -v
/Applications/oc new-project mez-co --display-name="nodejs" --description="Mez Node.js app"
/Applications/oc new-app -f openshift/templates/nodejs.json
/Applications/oc start-build mez-co --follow
/Applications/oc new-app centos/mongodb-26-centos7 -e MONGODB_USER=mez,MONGODB_DATABASE=product,MONGODB_PASSWORD=b23031984,MONGODB_ADMIN_PASSWORD=b23031984
oc status -v
/Applications/oc env pods --all --list
/Applications/oc set env dc/mez-coc MONGO_URL='mongodb://admin:b23031984@172.30.174.58:27017/mongo_db'

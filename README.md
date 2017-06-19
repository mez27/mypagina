npm install chai --save
npm install chai-http --save
npm install ejs --save
npm install express --save
npm install mocha --save
npm install mongodb --save
npm install morgan --save
npm install object-assign --save

git add .
git commit -am "cambios 3"
git push https://github.com/mez27/mypagina.git master

/Applications/oc login https://api.starter-us-west-2.openshift.com
/Applications/oc project mypagina
/Applications/oc status -v
/Applications/oc start-build mez-co --follow
/Applications/oc logs -f bc/mez-co

var Cloudant = require('cloudant');
var openwhisk = require('openwhisk');


var main = args => {

  let creds = {
    host: args.host,
    password: args.password,
    port: args.port,
    url: args.url,
    username: args.username,
    plugin: 'promises'
  };

  let cloudant = Cloudant(creds);

  let db = cloudant.use('users');
  let ow = openwhisk();

  let token = args.token;
  let actionName = `${args.namespace}/user_info`
  let blocking = true
  let params = {token}

  return new Promise((resolve, reject) => {
    ow.actions.invoke({actionName, blocking, params})
        .then(result => {
          console.log("in result");
          let uid = result.response.result.info.user_id;
          console.log(uid);
          let g = db.get(uid).catch((error) => {
            reject({error});
          }).then(res => {
            console.log(res);
            res.projects.push({ name: args.name, services: args.services.split(/\s*,\s*/)});
            db.insert(res).catch(error => reject({error}))
                .then(inserted => resolve({res}));
          });
          return g;
        });
  });
}

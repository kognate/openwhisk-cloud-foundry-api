var request = require('request');
var openwhisk = require('openwhisk');

var main = args => {
  var ow = openwhisk();
  return new Promise((resolve, reject) => {
    let actionName = `${args.namespace}/authorization_endpoint`
    let blocking = true
    let params = {api_url: args.api_url}
    ow.actions.invoke({actionName, blocking, params}).then( result => {
      let authorization_endpoint = result.response.result.authorization_endpoint 
    let request_options = {
      url: `${authorization_endpoint}/oauth/token`,
      method: 'POST',
      headers: {
	'authorization': 'Basic Y2Y6',
	'accept':  'application/json;charset=utf-8'
      },
      form: { grant_type: 'password',
	      username: args.username,
	      password: args.password },
    }
      
      request(request_options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
	resolve(JSON.parse(body));
      } else {
	reject({error, response});
      }
    });
    });
  }).catch(err => reject({error: err, msg: 'catch'}));
}

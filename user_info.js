var request = require('request');
var openwhisk = require('openwhisk');

var fetch_info = args => {
  let authorization_endpoint = args.response.response.result.authorization_endpoint

  let options = {
    url: `${authorization_endpoint}/userinfo`,
    headers: {
      'Authorization' : `bearer ${args.token}`
    }
  }
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let info = JSON.parse(body);
      args.resolve({info});
    } else {
      args.reject({error, response});
    }
  });
};

var fetch_endpoint = (args) => {
  let ow = openwhisk();
  return ow.actions.invoke(args);
};

var user_info = args => {
  let token = args.token;
  let actionName = `${args.namespace}/authorization_endpoint`
  let blocking = true
  let params = {}
  return new Promise((resolve, reject) => fetch_endpoint({actionName, blocking, params}).then(response => fetch_info({token, response, resolve, reject})));
}

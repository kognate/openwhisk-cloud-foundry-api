var request = require('request');

var endpoint = (args) => {

  return new Promise((resolve, reject) => request(`${args.api_url}/info`,
						  (error, response, body) => {
						    if (!error && response.statusCode == 200) {
						      resolve(JSON.parse(body));
						    } else {
						      reject({error, response});
						    }}));
}

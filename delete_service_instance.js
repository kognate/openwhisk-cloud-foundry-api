var request = require('request');

var delete_service_instance = args => {
    let instance_guid = args.id;
    let token = args.token;
    let api_url = args.api_url;

    let options = {
      method: 'DELETE',
      url: `${api_url}/v2/service_instances/${instance_guid}?accepts_incomplete=true&async=true`,
      headers: {
        'Authorization' : `bearer ${token}`
      }
    };

    return new Promise((resolve, reject) => request(options, (error, response, body) => {
      if (!error && (response.statusCode == 204 || response.statusCode == 202 )) {
        resolve({"status": "deleteing"});
      } else {
        reject({error, options, response, body});
      }
    }));
}

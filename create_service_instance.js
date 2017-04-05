var request = require('request');

var create_service_instance = args => {
    let space_guid = args.space_id;
    let service_plan_guid = args.plan_id;
    let token = args.token;
    let name = args.name;
    let api_url = args.api_url;

    let options = {
      method: 'POST',
      url: `${api_url}/v2/service_instances?accepts_incomplete=true`,
      body: JSON.stringify({ name, space_guid, service_plan_guid, parameters: {}, tags: [] }),
      headers: {
        'Authorization' : `bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    return new Promise((resolve, reject) => request(options, (error, response, body) => {
      if (!error && response.statusCode == 201) {
        let json = JSON.parse(body);
        resolve(json);
      } else {
        reject({error, options, response, body});
      }
    }));
}

var request = require('request');

var user_organizations = args => {
    let token = args.token;
    let api_url = args.api_url;

    let options = {
      url: `${api_url}/v2/organizations`,
      headers: {
        'Authorization' : `bearer ${token}`
      }
    };

    return new Promise((resolve, reject) => request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let json = JSON.parse(body);
        resolve(json);
      } else {
        reject({error});
      }
    }));
}

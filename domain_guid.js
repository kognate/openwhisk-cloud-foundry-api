var request = require('request');

var domain_guid = args => {
  let token = args.token
  let api_url = args.api_url
  let get_path = `/v2/shared_domains`
  let to_get = `${api_url}${get_path}`
  let options = {
    url: to_get,
    headers: {
      'Authorization' : `bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
	let json = JSON.parse(body);
	let guids = json.resources.map((item) => {
	  return {guid: item.metadata.guid, name: item.entity.name };
	});
	resolve({guids});
      } else {
	reject({error, response, body});
      }
    });
  });
}

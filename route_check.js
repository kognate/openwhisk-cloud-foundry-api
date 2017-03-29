var request = require('request');

var route_check = args => {
  let token = args.token
  let host = args.host
  let api_url = args.api_url
  let domain_guid = args.domain_guid
  let get_host = `/host/${host}`
  let get_path = `/v2/routes/reserved/domain/${domain_guid}`
  let to_get = `${api_url}${get_path}${get_host}`
  let options = {
    url: to_get,
    headers: {
      'Authorization' : `bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 204) {
	resolve({status: 'acquired'});
      } else if (!error && response.statusCode == 404) {
	resolve({status: 'free'});
      } else {
	reject({error, response, body});
      }
    });
  });
}
  

   

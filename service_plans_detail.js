var request = require('request');

var service_plans_detail = args => {
  let guid = args.id;
  let token = args.token;
  let api_url = args.api_url;

  let options = {
    url: `${api_url}/v2/services/${guid}/service_plans`,
    headers: {
      'Authorization' : `bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let base_result = JSON.parse(body);
      let result = base_result.resources.map((item) => {
	let pextra = JSON.parse(item.entity.extra);
	item.entity.extra = pextra;
	return item;
      });
      resolve({result});
    } else {
      reject({error});
    }
  }));
}

var request = require('request');

var is_watson = (item) => item.entity.tags.includes('watson') && item.entity.active;

var parse_extra = (item) => {
  let pextra = JSON.parse(item.entity.extra);
  item.entity.extra = pextra;
  return item;
}

var fetch_rec = (request_options, resolve, reject, acc) => {
  request(request_options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let result = JSON.parse(body);
      acc.result = acc.result.concat(result.resources
				           .filter(is_watson)
 				           .map(parse_extra));

      if (result.next_url) {
	request_options.url = `${acc.api_url}${result.next_url}`
	fetch_rec(request_options, resolve, reject, acc);
      } else {
	resolve(acc);
      }
    } else {
      reject({error, response});
    }
  })
}

var services = args => {
  let token = args.token;
  let api_url = args.api_url;

  let options = {
    url: `${api_url}/v2/services`,
    headers: {
      'Authorization' : `bearer ${token}`
    }
  };
  return new Promise((resolve, reject) => fetch_rec(options,
						    resolve,
						    reject,
						    { result: [], api_url: api_url}));
}

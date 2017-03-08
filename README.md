# PREREQUISITES

You'll need the `jq` utility installed.  If you are on a Mac, you can do a `brew install jq`
and it will install the correct one.

You'll also need the `wsk` command line utilities installed.  You can get that package from
`https://console.ng.bluemix.net/openwhisk/learn/cli`  for your platform.

Once you've installed all that, you'll need to set an `env` variable for the `wsk` exmaples below.  You can do that by running the following in a terminal[1]:

```
eval $(cat ~/.cf/config.json |jq -crM '.AccessToken, .Target'  |awk '{if ($1 == "bearer") {print "export BEARER_TOKEN="$2} else { print "export API_URL=\""$1"\"" }}')
```


# Creating the Actions

Find your personal namespace using the namespace list command:

`wsk namespace list`

These namespaces follow a naming patter of `org`_`space` from Bluemix. Then set an environment
variable to your namespace.

`export WSK_NAMESPACE='/joshua.b.smith@us.ibm.com_testing'`

Now, you can create the `services` action.  This action will list all watson services from the `cf` catalog.

`wsk action create ${WSK_NAMESPACE}/services services.js --main services --param api_url ${API_URL}`

the `--param` here supplies the default parameter for the cloud
foundry api url.  This will automatically be passed to each invocation
of the action. We can also override it by passing in a value for that
param.

You can invoke this action synchronously using the `wsk` command:

`wsk action invoke --result --blocking ${WSK_NAMESPACE}/services --param token ${BEARER_TOKEN}`

Which should output a bunch of json.  You can then expose this action
via the `api-experimental` command.

`wsk api-experimental create /e2e/v1 /services POST ${WSK_NAMESPACE}/services`

This will expose the action via a simple REST endpoint (the specific endpoint will
be displayed when you run the command).  For example:

```
$ wsk api-experimental create /e2e/v1 /services POST ${WSK_NAMESPACE}/services
ok: created API /e2e/v1/services POST for action /joshua.b.smith@us.ibm.com_testing/services
https://f597ede0-4d1a-4151-8c11-1058e7d3a9a4-gws.api-gw.mybluemix.net/e2e/v1/services
```

Anyone can now call that action and pass in their bearer token using
curl (the url will be different for you and is displayed in the
previous command):

```
curl -X POST -d "{\"token\": \"${BEARER_TOKEN}\"}" \
https://f597ede0-4d1a-4151-8c11-1058e7d3a9a4-gws.api-gw.mybluemix.net/e2e/v1/services
|jq -c '.result[] | [.entity.extra.displayName, .metadata.guid]'
```

Implement the pricing plan fetcher requires a similar sequence of actions. 

`wsk action create ${WSK_NAMESPACE}/service_plans_detail service_plans_detail.js --main service_plans_detail --param api_url ${API_URL}`

Now you can invoke that action with a guid you got from the above command.


```
wsk action invoke --result --blocking ${WSK_NAMESPACE}/service_plans_detail \
--param token ${BEARER_TOKEN} --param id 8f89831e-5cc8-4fa8-9a2d-0e7989296f25 \
|jq '.result[] | [.entity.name, .entity.description]'
```

Lastly, expose the service plans details action via the `api-experimental`

```
wsk api-experimental create /e2e/v1 /service_plans_detail POST ${WSK_NAMESPACE}/service_plans_detail
```

And you can call the created url much like the services url.

```
curl -X POST -d "{ \"token\": \"${BEARER_TOKEN}\",  \
                   \"id\": \"8f89831e-5cc8-4fa8-9a2d-0e7989296f25\"}" \
https://f597ede0-4d1a-4151-8c11-1058e7d3a9a4-gws.api-gw.mybluemix.net/e2e/v1/service_plans_detail \
|jq '.result[] | [.entity.name, .entity.description]'
```

Now, drink mate.









---
[1] this sets up two env vars for later






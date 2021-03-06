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
|jq '.result[] | [.entity.name, .metadata.guid, .entity.description]'   
```

Now, drink mate.


# Extra Information

## Authentication and Bearer Tokens

Cloud Foundry (CF) uses a seperate url for authentication.  If you wanted to get
the bearer token for a given user and you have that username and password you can login
directly.

### Get the Authorization Endpoint


First, create the action:

`wsk action create ${WSK_NAMESPACE}/authorization_endpoint authorization_endpoint.js --main endpoint --param api_url ${API_URL}`

Then you can call this action and get the `authorization_endpoint` key from the json returned.

Once you have that URL, you can login and get your bearer token.  The code presented
uses the [npm openwhisk module](https://www.npmjs.com/package/openwhisk) to call an action from
inside another action.

`wsk action create ${WSK_NAMESPACE}/login login.js --main main --param api_url ${API_URL} --param namespace ${WSK_NAMESPACE}`

This action calls the `authorization_endpoint` action to get the endpoint and then logs in using
`username` and `password`

Now you can get your bearer token like this:

`wsk action invoke --blocking --result ${WSK_NAMESPACE}/login --param username joshua.b.smith@us.ibm.com --param password ${MY_PASSWORD} |jq '.access_token'`

Then we can add this via api-experimental.

`wsk api-experimental create /e2e/v1 /login POST ${WSK_NAMESPACE}/login`

## get user info

`wsk action create ${WSK_NAMESPACE}/user_info user_info.js --main user_info --param namespace ${WSK_NAMESPACE}` --param api_url ${API_URL}

`wsk action invoke --blocking --result /joshua.b.smith@us.ibm.com_testing/user_info --param token ${BEARER_TOKEN}`

`wsk api-experimental create /e2e/v1 /user_info POST ${WSK_NAMESPACE}/user_info`


##  projects
```
wsk action create ${WSK_NAMESPACE}/db_user_data db_user_data.js -P cloudant_default_params.json
wsk action create ${WSK_NAMESPACE}/db_create_project db_create_project.js -P cloudant_default_params.json
wsk api-experimental create /e2e/v1 /projects GET ${WSK_NAMESPACE}/db_user_data
wsk api-experimental create /e2e/v1 /projects POST ${WSK_NAMESPACE}/db_create_project

wsk action create ${WSK_NAMESPACE}/services_filter service_filter.js --main filtered
wsk action create ${WSK_NAMESPACE}/filter_services --sequence ${WSK_NAMESPACE}/services,${WSK_NAMESPACE}/services_filter
wsk api-experimental create /e2e/v1 /filter_services GET ${WSK_NAMESPACE}/filter_services
```

## apps

```
wsk action create ${WSK_NAMESPACE}/apps apps.js --main apps --param api_url ${API_URL}
wsk api-experimental create /e2e/v1 /apps GET ${WSK_NAMESPACE}/apps
```

## Route checking

### Get domain guids

```
wsk action create domain_guid domain_guid.js --main domain_guid --param api_url https://api.ng.bluemix.net
```

Invoke it:

```
wsk action invoke --blocking --result domain_guid --param token $BEARER_TOKEN
```

Result:

```
{
    "guids": [
        {
            "guid": "f4b90d7e-2cd3-4d30-b200-f28bbaf6be20",
            "name": "mybluemix.net"
        }
    ]
}
```

### Check if host route in domain is taken

```
wsk action create route_check route_check.js --main route_check --param api_url https://api.ng.bluemix.net
```

Invoke it:

```
$ wsk action invoke route_check --blocking --result --param token $BEARER_TOKEN \
        --param host discovery-news \
        --param domain_guid f4b90d7e-2cd3-4d30-b200-f28bbaf6be20
```

Result:

```
{
    "status": "free"
}
```


### Get all Organizations and Spaces for the user

#### Organizations
```
wsk action create user_organizations user_organizations.js --main user_organizations --param api_url https://api.ng.bluemix.net
```

Invoke it!

```
wsk action invoke user_organizations --blocking --result --param token $BEARER_TOKEN \
|jq -c '.resources[] | [.entity.name, .metadata.guid]'
```

#### Spaces

```
wsk action create user_spaces_for_organizations user_spaces_for_organizations.js --main user_spaces_for_organizations --param api_url https://api.ng.bluemix.net
```

Invoke it!

```
wsk action invoke user_spaces_for_organization --blocking --result \
--param token $BEARER_TOKEN \
--param token id ${GUID}
|jq -c '.resources[] | [.entity.name, .metadata.guid]'
```

### Service Instances

#### Get all service Instances

```
wsk action create service_instances service_instances.js --main service_instances --param api_url https://api.ng.bluemix.net
```

Invoke it!

```
wsk action invoke service_instances --blocking --result --param token $BEARER_TOKEN |jq -c '.result[] | [.entity.name, .metadata.guid]'
```

#### Create a service instnace

```
wsk action create create_service_instance create_service_instance.js --main create_service_instance --param api_url https://api.ng.bluemix.net
```

Invoke It!

you can get the space id and the plan id from `user_spaces_for_organizations` and `service_plans_detail`

```
wsk action invoke create_service_instance --blocking --result --param token $BEARER_TOKEN --param space_id $SPACE_ID --param plan_id $PLAN_ID --param name supergenius
```

### Delete a service instance (DANGEROUS!)

```
wsk action create delete_service_instance delete_service_instance.js --main delete_service_instance --param api_url https://api.ng.bluemix.net
```

Invoke it!

```
wsk action invoke delete_service_instance --blocking --result --param token $BEARER_TOKEN --param id $INSTANCE_ID
```
---
[1] this sets up two env vars for later

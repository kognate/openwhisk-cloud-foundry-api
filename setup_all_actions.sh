#!/bin/bash

eval $(cat ~/.cf/config.json |jq -crM '.AccessToken, .Target'  |awk '{if ($1 == "bearer") {print "export BEARER_TOKEN="$2} else { print "export API_URL=\""$1"\"" }}')

export WSK_NAMESPACE='/WatsonPlatformServices_demos/bluemix'

wsk action create ${WSK_NAMESPACE}/services services.js --main services --param api_url ${API_URL}
wsk api-experimental create /e2e/v1 /services POST ${WSK_NAMESPACE}/services

wsk action create ${WSK_NAMESPACE}/service_plans_detail service_plans_detail.js --main service_plans_detail --param api_url ${API_URL}
wsk api-experimental create /e2e/v1 /service_plans_detail POST ${WSK_NAMESPACE}/service_plans_detail

wsk action create ${WSK_NAMESPACE}/authorization_endpoint authorization_endpoint.js --main endpoint --param api_url ${API_URL}

wsk action create ${WSK_NAMESPACE}/login login.js --main main --param namespace ${WSK_NAMESPACE} --param api_url ${API_URL}

wsk api-experimental create /e2e/v1 /login POST ${WSK_NAMESPACE}/login --param namespace ${WSK_NAMESPACE} --param api_url ${API_URL}

wsk action create ${WSK_NAMESPACE}/user_info user_info.js --main user_info --param namespace ${WSK_NAMESPACE} --param api_url ${API_URL}
wsk api-experimental create /e2e/v1 /user_info POST ${WSK_NAMESPACE}/user_info

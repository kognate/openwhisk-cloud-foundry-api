// wsk action create ${WSK_NAMESPACE}/services_filter service_filter.js --main filtered
// wsk action create ${WSK_NAMESPACE}/filter_services --sequence ${WSK_NAMESPACE}/services,${WSK_NAMESPACE}/services_filter
// wsk api-experimental create /e2e/v1 /filter_services GET ${WSK_NAMESPACE}/filter_services
var filtered = (args) => {
    return new Promise((resolve, reject) => {
        resolve({res: args.result.map((item) => { return { guid: item.metadata.guid,
             label: item.entity.label,
             documentation: item.entity.extra.documentationUrl,
             name: item.entity.extra.displayName }})});
    });
}

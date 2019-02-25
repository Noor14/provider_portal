import { environment } from '../../environments/environment';

export let baseApi;
export let baseExternalAssets;
if (environment.qa) {
    // QA URL
    baseApi = "http://10.20.1.13:8091/api/";
    baseExternalAssets = "http://10.20.1.13:8091";
    // baseApi = "http://10.20.1.13:7091/api/";
    // baseExternalAssets = "http://10.20.1.13:7091";

}
else if (environment.pers) {
    // DEV URL
    baseApi = "http://10.20.1.13:9091/api/";
    baseExternalAssets = "http://10.20.1.13:9091";

}
else if (environment.prod) {
    // PROD URL
    // baseApi = "http://partner.hashmove.com:81/api/";
    // baseExternalAssets = "http://partner.hashmove.com:81";

    baseApi = "https://betaapi.hashmove.com/api/";
    baseExternalAssets = "https://betaapi.hashmove.com";
    // baseApi = "https://betademoapi.hashmove.com/api/";
    // baseExternalAssets = "https://betademoapi.hashmove.com";
}
else {
    // PERSONAL URL
    baseApi = "http://10.20.1.53/api/";
    baseExternalAssets = "http://10.20.1.53";
}



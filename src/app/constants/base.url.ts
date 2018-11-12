import { environment } from '../../environments/environment';

export let baseApi;
export var baseExternalAssets;

if (environment.qa) {
    // QA URL
    baseApi = "http://10.20.1.13:8095/api/";
    baseExternalAssets = "http://10.20.1.13:8095";
}
else if (environment.prod) {
    // QA URL
    baseApi = "http://partner.hashmove.com:81/api/";
    // baseApi = "http://210.2.139.184:81/api/";
    baseExternalAssets = "http://partner.hashmove.com:81";
    

}
else{
    // Dev URL
    baseApi = "http://10.20.1.13:9095/api/";
    baseExternalAssets = "http://10.20.1.13:9095";
    
} 



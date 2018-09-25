import { environment } from '../../environments/environment';

export let baseApi;
if (environment.qa) {
    // QA URL
    baseApi = "http://10.20.1.13:8095/api/";
    
} else{
    // Dev URL
    baseApi = "http://10.20.1.13:9095/api/";
} 

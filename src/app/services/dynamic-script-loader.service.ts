import { Injectable } from '@angular/core';


interface Scripts {
  name: string;
  src: string;
}

export const ScriptStore: Scripts = { name: 'paytabjs', src: 'https://www.paytabs.com/express/express_checkout_v3.js' };

declare var document: any;

@Injectable()
export class DynamicScriptLoaderService {
  private scripts: any = {};
  constructor() {
      this.scripts[ScriptStore.name] = {
        loaded: false,
        src: ScriptStore.src
      };
  }
  loadScript() {
    return new Promise((resolve, reject) => {
      let name:string = "paytabjs";
      if (!this.scripts[name].loaded) {
        //load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  //IE
          script.onreadystatechange = () => {
            if (script.readyState === "loaded" || script.readyState === "complete") {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  //Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
    });
  }


}

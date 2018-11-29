import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl  } from '@angular/platform-browser';
@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: any, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
   
        switch (type) {
        case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
			case 'style': return this.sanitizer.bypassSecurityTrustStyle(value);
			case 'script': return this.sanitizer.bypassSecurityTrustScript(value);
            case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
            case 'url': {
                //     var els = document.querySelectorAll("a[target ='_blank']") as any;
                // for (var i = 0; i < els.length; i++) {
                //     var el = els[i];
                //     el.addEventListener("click", function (e) {
                //         e.stopPropagation();
                //         e.preventDefault();
                //     }, false);
                        return this.sanitizer.bypassSecurityTrustUrl(value);
            };
			default: throw new Error(`Invalid safe type specified: ${type}`);
        }
    }
 
}
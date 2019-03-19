import { Pipe, PipeTransform, Directive, HostListener } from '@angular/core';
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
            case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
			default: throw new Error(`Invalid safe type specified: ${type}`);
        }
    }
 
}
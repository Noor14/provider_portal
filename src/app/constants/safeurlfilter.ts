import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl' })
export class SafeUrl implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(html) {
        html.stopPropagation();
        // return this.sanitizer.bypassSecurityTrustStyle(html);
        // return this.sanitizer.bypassSecurityTrustHtml(html);
        // return this.sanitizer.bypassSecurityTrustScript(html);
        // return this.sanitizer.bypassSecurityTrustUrl(html);
        return this.sanitizer.bypassSecurityTrustResourceUrl(html);
    }
}
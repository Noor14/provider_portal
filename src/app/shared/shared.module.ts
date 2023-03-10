import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './loader/loader.component';
import { UiTableComponent } from './tables/ui-table/ui-table.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { UpdatePriceComponent } from './dialogues/update-price/update-price.component';
import { AddDocumentComponent } from './dialogues/add-document/add-document.component';
import { VideoDialogueComponent } from './dialogues/video-dialogue/video-dialogue.component';
import { CookieBarComponent } from './dialogues/cookie-bar/cookie-bar.component';

@NgModule({
  imports: [CommonModule, NgbModule, FormsModule, NgxPaginationModule],
  declarations: [
    LoaderComponent,
    UiTableComponent,
    UpdatePriceComponent,
    AddDocumentComponent,
    VideoDialogueComponent,
    CookieBarComponent,
  ],
  exports: [
    LoaderComponent,
    UiTableComponent,
    UpdatePriceComponent,
    AddDocumentComponent,
    CookieBarComponent
  ],
  entryComponents: [
    VideoDialogueComponent
  ]
})
export class SharedModule { }

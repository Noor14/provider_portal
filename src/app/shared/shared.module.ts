import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './loader/loader.component';
import { UiTableComponent } from './tables/ui-table/ui-table.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { UpdatePriceComponent } from './dialogues/update-price/update-price.component';

@NgModule({
  imports: [CommonModule, NgbModule, FormsModule, NgxPaginationModule],
  declarations: [LoaderComponent, UiTableComponent, UpdatePriceComponent],
  exports: [LoaderComponent, UiTableComponent, UpdatePriceComponent]
})
export class SharedModule {}

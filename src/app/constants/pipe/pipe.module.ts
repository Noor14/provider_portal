import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './truncateFilter';
import { CheckboxPipe } from './checkbox.pipe';
import { UniquePipe } from './unique-recordFilter';
import { SearchBookingMode } from './dashboardBookingsFilter';
import { SearchPipe } from './search.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [TruncatePipe, CheckboxPipe, UniquePipe, SearchBookingMode, SearchPipe],
  exports: [
    TruncatePipe,
    CheckboxPipe,
    UniquePipe,
    SearchBookingMode,
    SearchPipe
  ]
})
export class PipeModule { }

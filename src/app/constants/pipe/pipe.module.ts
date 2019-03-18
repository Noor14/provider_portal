import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './truncateFilter';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [TruncatePipe],
  exports: [
    TruncatePipe
  ]
})
export class PipeModule { }

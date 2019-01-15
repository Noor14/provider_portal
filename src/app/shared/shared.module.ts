import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  imports: [
    CommonModule,
    // FormsModule,
    // ReactiveFormsModule
  ],
 declarations: [LoaderComponent],
 exports: [LoaderComponent]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { LoaderComponent } from '../../shared/loader/loader.component'
 
@NgModule({
  imports: [
    CommonModule,
    PagesRoutingModule
  ],
  declarations: [
    PagesComponent,
    HeaderComponent,
    FooterComponent,
    LoaderComponent
  ]
})
export class PagesModule { }

import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { CommonService } from './services/common.service';
import { SharedService } from './services/shared.service';
import { ToastrModule } from 'ngx-toastr';
import { ScrollbarModule } from 'ngx-scrollbar';
import { Interceptor } from './http-interceptors/interceptor';
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ScrollbarModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    ToastrModule.forRoot({
      closeButton: true,
      preventDuplicates: true,
      // disableTimeOut:true
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    },
    CommonService,
    SharedService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

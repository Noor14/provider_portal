import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { LoaderComponent } from '../../shared/loader/loader.component'
import { LoginDialogComponent } from '../../shared/dialogues/login-dialog/login-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from '../../shared/dialogues/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from '../../shared/dialogues/update-password/update-password.component';
import { ConfirmLogoutDialogComponent } from '../../shared/dialogues/confirm-logout-dialog/confirm-logout-dialog.component';
import { UserService } from './user/user.service';
 
@NgModule({
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    NgbModule.forRoot()
  ],
  declarations: [
    PagesComponent,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    LoginDialogComponent,
    ForgotPasswordComponent,
    UpdatePasswordComponent,
    ConfirmLogoutDialogComponent,
    // CancelBookingDialogComponent,
    // ConfirmModifySearchComponent,
    // ShareshippingComponent,
    // ConfirmDeleteAccountComponent,
    // ConfirmBookingDialogComponent
  ],
  entryComponents: [
    LoginDialogComponent,
    ForgotPasswordComponent,
    UpdatePasswordComponent,
    ConfirmLogoutDialogComponent,
 
  ],
  providers: [
    UserService,
   ]
})
export class PagesModule { }

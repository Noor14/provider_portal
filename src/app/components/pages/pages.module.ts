import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
// import { LoaderComponent } from '../../shared/loader/loader.component'
import { LoginDialogComponent } from '../../shared/dialogues/login-dialog/login-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from '../../shared/dialogues/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from '../../shared/dialogues/update-password/update-password.component';
import { ConfirmLogoutDialogComponent } from '../../shared/dialogues/confirm-logout-dialog/confirm-logout-dialog.component';
import { UserCreationService } from './user-creation/user-creation.service';
import { BookingInvoiceComponent } from './user-desk/booking-invoice/booking-invoice.component';
import { ReUploadDocComponent } from '../../shared/dialogues/re-upload-doc/re-upload-doc.component';
import { BasicInfoService } from './user-creation/basic-info/basic-info.service';
import { CompanyInfoService } from './user-creation/company-info/company-info.service';
import { DiscardDraftComponent } from '../../shared/dialogues/discard-draft/discard-draft.component';
import { ConfirmDeleteDialogComponent } from '../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
 
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
    LoginDialogComponent,
    ForgotPasswordComponent,
    UpdatePasswordComponent,
    ConfirmLogoutDialogComponent,
    BookingInvoiceComponent,
    ReUploadDocComponent,
    DiscardDraftComponent,
    ConfirmDeleteDialogComponent
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
    BookingInvoiceComponent,
    ReUploadDocComponent,
    DiscardDraftComponent,
    ConfirmDeleteDialogComponent
 
  ],
  providers: [
    UserCreationService,
    CompanyInfoService,
    BasicInfoService,
   ]
})
export class PagesModule { }

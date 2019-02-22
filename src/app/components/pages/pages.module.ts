import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { LoginDialogComponent } from '../../shared/dialogues/login-dialog/login-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from '../../shared/dialogues/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from '../../shared/dialogues/update-password/update-password.component';
import { ConfirmLogoutDialogComponent } from '../../shared/dialogues/confirm-logout-dialog/confirm-logout-dialog.component';
import { UserCreationService } from './user-creation/user-creation.service';
import { BookingInvoiceComponent } from './user-desk/booking-invoice/booking-invoice.component';
import { ReUploadDocComponent } from '../../shared/dialogues/re-upload-doc/re-upload-doc.component';
import { BasicInfoService } from './user-creation/basic-info/basic-info.service';
import { DiscardDraftComponent } from '../../shared/dialogues/discard-draft/discard-draft.component';
import { ConfirmDeleteDialogComponent } from '../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
import { SeaRateDialogComponent } from '../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
import { BookingStatusUpdationComponent } from '../../shared/dialogues/booking-status-updation/booking-status-updation.component';
import { AirRateDialogComponent } from '../../shared/dialogues/air-rate-dialog/air-rate-dialog.component';
import { GroundRateDialogComponent } from '../../shared/dialogues/ground-rate-dialog/ground-rate-dialog.component';
import { TruncatePipe } from '../../constants/truncateFilter';
import { RateHistoryComponent } from '../../shared/dialogues/rate-history/rate-history.component';
import { RateValidityComponent } from '../../shared/dialogues/rate-validity/rate-validity.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    NgSelectModule
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
    ConfirmDeleteDialogComponent,
    SeaRateDialogComponent,
    BookingStatusUpdationComponent,
    AirRateDialogComponent,
    GroundRateDialogComponent,
    RateHistoryComponent,
    RateValidityComponent,
    TruncatePipe
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
    ConfirmDeleteDialogComponent,
    SeaRateDialogComponent,
    BookingStatusUpdationComponent,
    AirRateDialogComponent,
    GroundRateDialogComponent,
    RateHistoryComponent,
    RateValidityComponent

  ],
  providers: [
    UserCreationService,
    BasicInfoService
  ]
})
export class PagesModule { }

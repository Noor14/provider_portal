import { Component, OnInit, Input, Renderer2, ElementRef } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { EMAIL_REGEX, ValidateEmail, Tea } from '../../../constants/globalfunctions';
// import { SearchResultService } from '../../../components/search-results/fcl-search/fcl-search.service';
// import { ShareShippingInfo } from '../../../interfaces/share-shipping-info';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-shareshipping',
  templateUrl: './shareshipping.component.html',
  styleUrls: ['./shareshipping.component.scss']
})
export class ShareshippingComponent implements OnInit {

  @Input() shareObjectInfo: any;
  shareDetailForm;
  loginUser;
  toemailError;
  fromemailError;
  noteError;
  subjectError;
  loading;
  constructor(
    private _activeModal: NgbActiveModal,
    private _renderer: Renderer2,
    private el: ElementRef,
    private _toast: ToastrService,
    // private _searchResult: SearchResultService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal());
  }
  ngOnInit() {
    // this.loginUser = JSON.parse(Tea.getItem('loginUser'));
    // this.shareDetailForm = new FormGroup({
    //   toEmail: new FormControl(null, [
    //     Validators.required,
    //     Validators.pattern(EMAIL_REGEX),
    //     Validators.maxLength(320)
    //   ]),
    //   fromEmail: new FormControl(null, [
    //     Validators.required,
    //     Validators.pattern(EMAIL_REGEX),
    //     Validators.maxLength(320)
    //   ]),
    //   subject: new FormControl('',[Validators.required, Validators.maxLength(200)]),
    //   note: new FormControl('',[Validators.required, Validators.maxLength(1000)]),
    // });

    if (this.loginUser && !this.loginUser.IsLogedOut && this.loginUser.UserID) {
      var input = this.el.nativeElement.querySelector('input.fromEmail');
      this._renderer.setAttribute(input, 'readonly', 'true');
      let info = "HashMove: Freight prices for " +  this.shareObjectInfo.carrier.PolCode + " -> " + this.shareObjectInfo.carrier.PodCode + " by " + this.loginUser.FirstName + " " + this.loginUser.LastName;
      this.shareDetailForm.controls.fromEmail.value = this.loginUser.PrimaryEmail;
      this.shareDetailForm.controls.subject.value = info;
      this.shareDetailForm.controls.note.value = info;
    }
    else if (!this.loginUser || (this.loginUser && this.loginUser.IsLogedOut)) {
      let info = "HashMove: Freight prices for " +  this.shareObjectInfo.carrier.PolCode + " -> " + this.shareObjectInfo.carrier.PodCode;
      this.shareDetailForm.controls.subject.value = info;
      this.shareDetailForm.controls.note.value = info;
    }
  }
  errorMessages() {
    if (this.shareDetailForm.controls.toEmail.status == "INVALID" && this.shareDetailForm.controls.toEmail.touched) {
      this.toemailError = true;
    }
    if (this.shareDetailForm.controls.fromEmail.status == "INVALID" && this.shareDetailForm.controls.fromEmail.touched) {
      this.fromemailError = true;
    }

    if (this.shareDetailForm.controls.subject.status == "INVALID" && this.shareDetailForm.controls.subject.touched) {
      this.subjectError = true;
    }
    if (this.shareDetailForm.controls.note.status == "INVALID" && this.shareDetailForm.controls.note.touched) {
      this.noteError = true;
    }



  }
  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
  shareInfo(data) {
    this.loading = true;
    // let validToemail: boolean = ValidateEmail(data.toEmail);
    // let validFromemail: boolean = ValidateEmail(data.fromEmail);
    if (this.shareDetailForm.invalid) {
      this.loading = false;
      return;
    }
    // else if (!validToemail) {
    //   this.loading = false;
    //   this._toast.warning('Invalid email entered.', 'Failed')
    //   return
    // }
    // else if (!validFromemail) {
    //   this.loading = false;
    //   this._toast.warning('Invalid email entered.', 'Failed')
    //   return
    // }
    let obj = {
      ToEmail: data.toEmail,
      FromEmail: data.fromEmail,
      LoginID: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.LoginID : "",
      FirstName: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.FirstName : "",
      LastName: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.LastName : "",
      Subject: data.subject,
      Note: data.note,
      CarrierDetails:  (this.shareObjectInfo.carrier)? this.shareObjectInfo.carrier:{},
      ProviderDetails: {}
    }
    if(this.shareObjectInfo.provider){
      if(!this.shareObjectInfo.provider.ProviderInsurancePercent) this.shareObjectInfo.provider.ProviderInsurancePercent = 0;
      if(!this.shareObjectInfo.provider.ProviderBusYear) this.shareObjectInfo.provider.ProviderBusYear = 0;
      obj.ProviderDetails = this.shareObjectInfo.provider;
    }
    // this._searchResult.shareShippingInfo(obj).subscribe((res: any) => {
    //   this.loading = false;
    //   if (res.returnStatus == "Error") {
    //     this._toast.error(res.returnText);
    //   }
    //   else if (res.returnStatus == "Success") {
    //     this._toast.success("Details shared successfully.");
    //     this.shareDetailForm.reset();
    //     this.closeModal();
    //   }
    // }, (err: HttpErrorResponse) => {
    //   this.loading = false;

    // })
  }
}

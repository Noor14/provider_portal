import { Component, OnInit, Input } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ViewBookingService } from '../../../components/pages/user-desk/view-booking/view-booking.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-re-upload-doc',
  templateUrl: './re-upload-doc.component.html',
  styleUrls: ['./re-upload-doc.component.scss']
})
export class ReUploadDocComponent implements OnInit {

  public docsReasons: any[];
  @Input() documentObj: any;
  public docReasonForm;
  selectedReason;
  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _viewBookingService: ViewBookingService,
    private _toast: ToastrService,
    
  ) { location.onPopState(() => this.closeModal()); }

  ngOnInit() {
    this.getDocReason();
    this.docReasonForm = new FormGroup({
      reasonType: new FormControl(null, Validators.required),
      reasonDesc: new FormControl(null)
    });
  }
  getDocReason(){
    this._viewBookingService.getDocReasons().subscribe((res:any)=>{
      if (res.returnStatus == "Success"){
        this.docsReasons = res.returnObject;
      }
    })
  }
  submitReason(){
    let obj = {
      documentID: this.documentObj.docID,
      documentTypeID: this.documentObj.docTypeID,
      reasonID: this.docReasonForm.value.reasonType,
      reason: this.docReasonForm.value.reasonDesc
    }
    this._viewBookingService.uploadDocReason(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.closeModal();
        this._toast.success(res.returnText);
      }
    })
  }

  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}

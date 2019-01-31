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
  public descError;
  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _viewBookingService: ViewBookingService,
    private _toast: ToastrService,
    
  ) { location.onPopState(() => this.closeModal(null)); }

  ngOnInit() {
    this.getDocReason();
    this.docReasonForm = new FormGroup({
      reasonType: new FormControl(null, {validators: [Validators.required]}),
      reasonDesc: new FormControl(null, {validators: [Validators.required, Validators.maxLength(1000)]})
    });
  }
  getDocReason(){
    this._viewBookingService.getDocReasons().subscribe((res:any)=>{
      if (res.returnStatus == "Success"){
        this.docsReasons = res.returnObject;
        // this.docReasonForm.controls['reasonType'].setValue(this.docsReasons[0].ReasonID);
      }
    })
  }
  submitReason(){
    let obj = {
      documentID: this.documentObj.docID,
      documentTypeID: this.documentObj.docTypeID,
      reasonID: this.docReasonForm.value.reasonType,
      documentStausRemarks: this.docReasonForm.value.reasonDesc,
      documentStaus: "RE-UPLOAD",
      documentLastApproverID: this.documentObj.userID,
      approverIDType: "PROVIDER",
      createdBy: this.documentObj.createdBy
    }
    this._viewBookingService.uploadDocReason(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
            let object = {
            status: obj.documentStaus,
            resType : res.returnStatus
           }
        this.closeModal(object);
        this._toast.success(res.returnText);
      }
    })
  }

  closeModal(status) {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}

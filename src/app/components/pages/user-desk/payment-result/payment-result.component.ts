import { Component, OnInit } from '@angular/core';
import { BillingService } from '../billing/billing.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent implements OnInit {

  constructor(
    private _billingService: BillingService,
    private _toastr: ToastrService,
    ) { }

  ngOnInit() {
    debugger
    this.addPayment();
  }
  addPayment() {
    let obj={}
    this._billingService.addPayment(obj).subscribe((res: any) => {
      // if (res.returnStatus == "Success") {
      console.log(res)
      this._toastr.success('Payment add successfully', '');
      }
    )

}
}

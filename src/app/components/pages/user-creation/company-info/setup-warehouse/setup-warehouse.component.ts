import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WarehouseService } from './warehouse.service';
@Component({
  selector: 'app-setup-warehouse',
  templateUrl: './setup-warehouse.component.html',
  styleUrls: ['./setup-warehouse.component.scss']
})
export class SetupWarehouseComponent implements OnInit {
  @ViewChild('stepper') public stepper: ElementRef;
  public wareHouseCat: any[];
  public categoryIds: any[] = [];  
  constructor(private warehouseService: WarehouseService) { }

  ngOnInit() {
    this.getWarehouseInfo();
  }

  getWarehouseInfo() {
    this.warehouseService.getWarehouseData().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.wareHouseCat = res.returnObject.whCategories;
        console.log(res);
      }
    })
  }

  categorySelection(obj, selectedCategory) {
    let selectedItem = selectedCategory.classList;
    if (this.categoryIds && this.categoryIds.length) {
      for (var i = 0; i < this.categoryIds.length; i++) {
        if (this.categoryIds[i].shippingCatID == obj.shippingCatID) {
          this.categoryIds.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }

    }
    if ((this.categoryIds && !this.categoryIds.length) || (i == this.categoryIds.length)) {
      selectedItem.add('active');
      this.categoryIds.push(obj);
    }


  }
}

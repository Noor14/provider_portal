import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sea-freight',
  templateUrl: './sea-freight.component.html',
  styleUrls: ['./sea-freight.component.scss']
})
export class SeaFreightComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  constructor() { }

  ngOnInit() {
    this.dtOptions = {
      // scrollY:        '300px',
      scrollX:        true,
      // scrollCollapse: true,
      paging:         false,
      // columnDefs: [ {
      //     orderable: false,
      //     className: 'select-checkbox',
      //     targets:   0
      // } ],

      // order: [[ 1, 'asc' ]]
    };
  }

}

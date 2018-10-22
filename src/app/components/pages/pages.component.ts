import { Component, OnInit } from '@angular/core';
import { loading } from '../../constants/globalFunctions';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    loading(false);
  }
}

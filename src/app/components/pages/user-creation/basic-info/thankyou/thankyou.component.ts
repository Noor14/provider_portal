import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.scss']
})
export class ThankyouComponent implements OnInit {

  public userData
  constructor() { }

  ngOnInit() {
    let info =localStorage.getItem('thankYouObject');
    this.userData = JSON.parse(info)
  }

}

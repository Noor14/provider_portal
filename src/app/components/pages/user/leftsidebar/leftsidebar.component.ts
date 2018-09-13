import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leftsidebar',
  templateUrl: './leftsidebar.component.html',
  styleUrls: ['./leftsidebar.component.scss']
})
export class LeftsidebarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  formatSubtitle = (percent: number) : string => {
    return percent + "%";
    // if(percent >= 100){
    //   return "Congratulations!"
    // }else if(percent >= 50){
    //   return "Half"
    // }else if(percent > 0){
    //   return percent + "%";
    // }else {
    //   return "Not started"
    // }
  }
}

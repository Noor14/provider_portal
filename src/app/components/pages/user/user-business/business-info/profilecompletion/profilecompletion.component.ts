import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../services/shared.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-profilecompletion',
  templateUrl: './profilecompletion.component.html',
  styleUrls: ['./profilecompletion.component.scss']
})
export class ProfilecompletionComponent implements OnInit {

  constructor(
    private _sharedService: SharedService,
    private _userService: UserService ) { }

  ngOnInit() {
    this._sharedService.formProgress.next(60);
    this._userService.getlabelsDescription('BusinessVerification').subscribe((res:any)=>{
      if(res.returnStatus =='Success'){
        console.log(res);
      }
    })
    
  }

}

import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../../services/shared.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-profilecompletion',
  templateUrl: './profilecompletion.component.html',
  styleUrls: ['./profilecompletion.component.scss']
})
export class ProfilecompletionComponent implements OnInit {

  public headingBaseLanguage;
  public headingOtherLanguage;
  public subheadingBaseLanguage;
  public subheadingOtherLanguage;
  public finishHeadingBaseLanguage;
  public finishHeadingOtherLanguage;
  public desc1BaseLanguage;
  public desc1OtherLanguage;
  public desc2BaseLanguage;
  public desc2OtherLanguage;
  public finishContentBaseLanguage;
  public finishContentOtherLanguage;
  public btnTextBaseLanguage;
  public btnTextOtherLanguage;
  public userAPPno;
  constructor(
    private _sharedService: SharedService,
    private _userService: UserService ) { }

  ngOnInit() {

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnCode) {
      this.userAPPno = userInfo.returnCode;
    }
    this._sharedService.formProgress.next(60);
    this._userService.getlabelsDescription('BusinessVerification').subscribe((res:any)=>{
      if(res.returnStatus =='Success'){
        let data = res.returnObject;
        data.forEach(element => {
          
          if(element.keyCode == "lbl_MainHeading"){
            this.headingBaseLanguage =  element.baseLang;
            this.headingOtherLanguage = element.otherLang;
          }
          else if(element.keyCode == "lbl_MainSubHeading"){
            this.subheadingBaseLanguage = element.baseLang.replace('{appNo}', this.userAPPno);
            this.subheadingOtherLanguage = element.otherLang.replace('{appNo}', this.userAPPno);;
          }
          else if(element.keyCode == "lbl_MainContent1"){
            this.desc1BaseLanguage = element.baseLang;
            this.desc1OtherLanguage = element.otherLang;
          }
          else if(element.keyCode == "lbl_MainContent2"){
            this.desc2BaseLanguage = element.baseLang;
            this.desc2OtherLanguage = element.otherLang;
          }
          else if(element.keyCode == "lbl_FinishHeading"){
            this.finishHeadingBaseLanguage = element.baseLang;
            this.finishHeadingOtherLanguage = element.otherLang;
          }
          else if(element.keyCode == "lbl_FinishContent"){
            this.finishContentBaseLanguage = element.baseLang;
            this.finishContentOtherLanguage = element.otherLang;
          }
          else if(element.keyCode == "btn_Procced"){
            this.btnTextBaseLanguage = element.baseLang;
            this.btnTextOtherLanguage = element.otherLang;
          }
        });
      }
    })
    
  }

}
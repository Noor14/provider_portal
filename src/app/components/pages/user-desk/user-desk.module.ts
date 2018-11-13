import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDeskComponent } from './user-desk.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [UserDeskComponent, SideBarComponent, DashboardComponent]
})
export class UserDeskModule { }

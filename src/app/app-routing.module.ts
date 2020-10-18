import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { DonationsComponent } from './donations/donations.component';
import { ModelViewerComponent } from './model-viewer/model-viewer.component'

const routes: Routes = [
  { path: '', component: ModelViewerComponent },
  { path: 'donate', component: DonationsComponent },
  { path: 'about', component:  AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
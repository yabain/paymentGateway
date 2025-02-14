import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TextEditorComponent } from './text-editor.component';

const routes: Routes = [{ path: '', component: TextEditorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TextEditorRoutingModule { }

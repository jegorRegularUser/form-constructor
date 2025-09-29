import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { EditorComponent } from './editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, EditorComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  title = 'Test Layout';
}
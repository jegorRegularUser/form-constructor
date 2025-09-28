import { Component } from '@angular/core';
import { TestSidebarComponent } from './test-sidebar.component';
import { TestEditorComponent } from './test-editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, TestSidebarComponent, TestEditorComponent],
  templateUrl: './test-layout.component.html',
  styleUrl: './test-layout.component.css'
})
export class TestLayoutComponent {
  title = 'Test Layout';
}
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './test-editor.component.html',
  styleUrl: './test-editor.component.css'
})
export class TestEditorComponent {
  title = 'Test Editor';
  content = 'This is a test editor component.';
  
  onContentChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.content = target.value;
  }
}
import { Component, Input, ElementRef, HostBinding } from '@angular/core';

@Component({
  selector: 'app-input',
  template: `
  <div class="input-content">
    <span class="input-text">{{ value }}</span>
    <ng-content></ng-content>
  </div>
`,
  styles: [`
    :host {
      display: block;
      min-width: 120px;
      min-height: 40px;
      background: #f5f5f5;
      border: 2px solid #ddd;
      border-radius: 6px;
      padding: 8px 12px;
      margin: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
    }

    :host(.dragged) {
      opacity: 0.3 !important;
      transform: scale(0.95);
      cursor: grabbing;
      pointer-events: none;
    }

    :host(.drop-preview) {
      border: 2px dashed #2196F3;
      background: rgba(33, 150, 243, 0.1);
    }

    .input-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .input-text {
      font-weight: 500;
      color: #333;
    }
  `]
})
export class InputComponent {
  @Input() value: string = '';
  @Input() id: string = '';
  @Input() set isDragged(value: boolean) {
    this._isDragged = value;
  }

  private _isDragged = false;

  @HostBinding('class.dragged') get draggedClass() { 
    return this._isDragged; 
  }

  constructor(private elementRef: ElementRef) {}

  getNativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
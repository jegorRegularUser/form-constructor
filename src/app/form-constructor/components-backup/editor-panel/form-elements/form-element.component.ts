import { Component, Input, Output, EventEmitter, ElementRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DroppedComponent } from '../../../../core/models/component.model';
import { BaseEditorComponent } from '../../../../interfaces/dnd.interface';

@Component({
  selector: 'app-form-element',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="component-preview" [style.min-width]="'0'">
      @switch (component.type) {
        @case ('text-input') {
          <div class="form-group preview">
            <label class="form-label">{{ component.properties['label'] }}</label>
            <input type="text" 
                   class="form-control"
                   [style.width]="'100%'" 
                   [placeholder]="component.properties['placeholder']"
                   disabled>
          </div>
        }
        @case ('email-input') {
          <div class="form-group preview">
            <label class="form-label">{{ component.properties['label'] }}</label>
            <input type="email" 
                   class="form-control"
                   [style.width]="'100%'" 
                   [placeholder]="component.properties['placeholder']"
                   disabled>
          </div>
        }
        @case ('textarea') {
          <div class="form-group preview">
            <label class="form-label">{{ component.properties['label'] }}</label>
            <textarea class="form-control" 
                      [rows]="component.properties['rows']"
                      [placeholder]="component.properties['placeholder']"
                      [style.width]="'100%'" disabled></textarea>
          </div>
        }
        @case ('select') {
          <div class="form-group preview">
            <label class="form-label">{{ component.properties['label'] }}</label>
            <select class="form-control" [style.width]="'100%'" disabled>
              <option>Choose option</option>
              @for (option of component.properties['options']; track option) {
                <option>{{ option }}</option>
              }
            </select>
          </div>
        }
        @case ('checkbox') {
          <div class="form-check preview">
            <input type="checkbox" 
                   class="form-check-input" 
                   [checked]="component.properties['checked']"
                   disabled>
            <label class="form-check-label">{{ component.properties['label'] }}</label>
          </div>
        }
        @case ('button') {
          <button type="button" 
                  class="btn"
                  [class]="'btn-' + component.properties['variant']"
                  [style.width]="component.properties['fullWidth'] ? '100%' : 'auto'"
                  disabled>
            {{ component.properties['text'] }}
          </button>
        }
        @case ('container') {
          <div
            class="form-container preview container-component"
            [attr.data-droppable]="'true'"
            [attr.data-component-id]="component.id"
            [attr.data-layout]="getContainerLayout(component)"
            [style.display]="component.properties['layout'] === 'grid' ? 'grid' : (component.properties['layout'] === 'flex' ? 'flex' : 'block')"
            [style.flex-direction]="component.properties['direction']"
            [style.gap]="component.properties['gap']"
            [style.grid-template-columns]="component.properties['layout'] === 'grid' ? ('repeat(' + component.properties['columns'] + ', 1fr)') : null"
            [style.padding]="component.properties['padding']"
            [style.width]="component.properties['width'] || 'fit-content'"
            [style.box-sizing]="'border-box'"
            [style.min-width]="'0'"
            [style.min-height]="'0'">

            @if (!component.children?.length) {
              <p class="container-placeholder">
                Drop components here
              </p>
            }

            <!-- Nested components -->
            @for (child of getFilteredChildren(component); track child.id) {
              <app-form-element
                [component]="child"
                [isSelected]="selectedComponentId === child.id"
                (click)="click.emit($event)"
                [attr.data-component-id]="child.id"
                class="nested-component">
              </app-form-element>
            }
          </div>
        }
      }
    </div>
  `,
  styles: `
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

    .component-preview {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .form-container {
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 8px;
      padding: 0.75rem;
      display: block;
      gap: 1rem;
      background: var(--container-bg, #fafafa);
      position: relative;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-container[style*="display: flex"] {
      display: flex;
      flex-wrap: nowrap;
      align-items: stretch;
      width: 100%;
      min-width: 0;
    }

    .form-container[style*="display: grid"] {
      width: 100%;
      min-width: 0;
    }

    .container-placeholder {
      width: 100%;
      text-align: center;
      color: #9aa0a6;
      padding: 1rem;
      box-sizing: border-box;
      min-width: 0;
    }

    .nested-component {
      width: 100%;
    }

    .form-control {
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }

    .btn {
      display: inline-block;
      white-space: nowrap;
    }
  `
})
export class FormElementComponent implements BaseEditorComponent {
  @Input() component!: DroppedComponent;
  @Input() isSelected: boolean = false;
  @Input() selectedComponentId: string | null = null;
  @Input() set isDragged(value: boolean) {
    this._isDragged = value;
  }
  @Output() click = new EventEmitter<{component: DroppedComponent, event: MouseEvent}>();

  private _isDragged = false;

  @HostBinding('class.dragged') get draggedClass() {
    return this._isDragged;
  }

  constructor(private elementRef: ElementRef) {}

  getFilteredChildren(component: DroppedComponent): DroppedComponent[] {
    return (component.children ?? []).filter((x): x is DroppedComponent => !!x);
  }

  /**
   * Get container layout for data-layout attribute
   */
  getContainerLayout(component: DroppedComponent): 'row' | 'column' {
    const direction = component.properties?.['direction'];
    const layout = component.properties?.['layout'];
    
    // If it's a flex container, use the direction
    if (layout === 'flex') {
      return direction === 'row' ? 'row' : 'column';
    }
    
    // Default to column for other layouts
    return 'column';
  }

  onElementClick(component: DroppedComponent, event: MouseEvent) {
    this.click.emit({ component, event });
  }

  // Implementation of BaseEditorComponent interface
  get id(): string {
    return this.component.id;
  }

  getNativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  get isDragged(): boolean {
    return this._isDragged;
  }
}
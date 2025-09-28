import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DroppedComponent } from '../../../../core/models/component.model';

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
export class FormElementComponent {
  @Input() component!: DroppedComponent;
  @Input() isSelected: boolean = false;
  @Input() selectedComponentId: string | null = null;
  @Output() click = new EventEmitter<{component: DroppedComponent, event: MouseEvent}>();

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
}
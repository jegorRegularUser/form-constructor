import { Injectable, signal } from '@angular/core';

export interface FormComponent {
  id: string;
  type: string;
  label: string;
  properties: any;
}

@Injectable({
  providedIn: 'root'
})
export class EditorPanelService {
  private components = signal<FormComponent[]>([]);
  
  readonly formComponents = this.components.asReadonly();
  
  addComponent(component: FormComponent): void {
    this.components.update(components => [...components, component]);
    this.emitFormChange();
  }
  
  removeComponent(id: string): void {
    this.components.update(components => components.filter(c => c.id !== id));
    this.emitFormChange();
  }
  
  updateComponent(id: string, properties: any): void {
    this.components.update(components =>
      components.map(comp =>
        comp.id === id ? { ...comp, properties: { ...comp.properties, ...properties } } : comp
      )
    );
    this.emitFormChange();
  }
  
  clearComponents(): void {
    this.components.set([]);
    this.emitFormChange();
  }
  
  generateFormHtml(): string {
    const components = this.components();
    if (components.length === 0) {
      return '<div class="form-container" style="padding: 2rem; border: 2px dashed #ccc; text-align: center; color: #666;">Drag components here to build your form</div>';
    }

    let html = '<div class="form-container" style="max-width: 600px; margin: 0 auto; padding: 1.5rem;">\\n';
    
    components.forEach(component => {
      switch (component.type) {
        case 'text-input':
        case 'email-input':
          html += `  <div class="form-group" style="width: 100%; margin-bottom: 1rem;">
    <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${component.properties.label}</label>
    <input type="${component.type === 'email-input' ? 'email' : 'text'}" 
           class="form-control" 
           style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;"
           placeholder="${component.properties.placeholder}"
           ${component.properties.required ? 'required' : ''} />
  </div>\\n`;
          break;
          
        case 'textarea':
          html += `  <div class="form-group" style="width: 100%; margin-bottom: 1rem;">
    <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${component.properties.label}</label>
    <textarea class="form-control" 
              style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem; resize: vertical;"
              rows="${component.properties.rows}"
              placeholder="${component.properties.placeholder}"></textarea>
  </div>\\n`;
          break;
          
        case 'select':
          html += `  <div class="form-group" style="width: 100%; margin-bottom: 1rem;">
    <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${component.properties.label}</label>
    <select class="form-control" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
      <option value="">Choose option</option>
${component.properties.options.map((opt: string) => `      <option value="${opt}">${opt}</option>`).join('\\n')}
    </select>
  </div>\\n`;
          break;
          
        case 'checkbox':
          html += `  <div class="form-check" style="margin-bottom: 1rem;">
    <input type="checkbox" class="form-check-input" ${component.properties.checked ? 'checked' : ''} />
    <label class="form-check-label">${component.properties.label}</label>
  </div>\\n`;
          break;
          
        case 'button':
          html += `  <button type="${component.properties.type}" 
           class="btn btn-${component.properties.variant}"
           style="padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; background: #3b82f6; color: white; cursor: pointer; font-weight: 500;">
    ${component.properties.text}
  </button>\\n`;
          break;
      }
    });
    
    html += '</div>';
    return html;
  }
  
  private emitFormChange(): void {
    const html = this.generateFormHtml();
    window.dispatchEvent(new CustomEvent('form:changed', {
      detail: { 
        html,
        components: this.components()
      }
    }));
  }
}
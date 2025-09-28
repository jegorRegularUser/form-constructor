# Инструкция по созданию компонента с Drag & Drop

## Структура компонента

### 1. Основные интерфейсы

```typescript
interface DroppedComponent {
  id: string;
  type: string;
  label: string;
  properties: any;
  children?: DroppedComponent[];
  parentId?: string | null;
}

interface DropZoneState {
  componentId: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | null;
}
```

### 2. Сигналы состояния

```typescript
// Основные данные
public droppedComponents = signal<DroppedComponent[]>([]);
public selectedComponentId = signal<string | null>(null);

// Управление DnD
public isCanvasHovered = signal<boolean>(false);
public canvasDropZone = signal<'top' | 'bottom' | null>(null);
public dropZones = signal<Map<string, 'top' | 'bottom' | 'left' | 'right'>>(new Map());
public hoverStates = signal<Map<string, boolean>>(new Map());

// Состояние перетаскивания
public dragGhost: HTMLElement | null = null;
public isDragging = signal<boolean>(false);
public dragSource: 'sidebar' | 'canvas' = 'sidebar';
```

### 3. Методы для шаблона

```typescript
getDropZone(componentId: string): 'top' | 'bottom' | 'left' | 'right' | null {
  return this.dropZones().get(componentId) || null;
}

getHoverState(componentId: string): boolean {
  return this.hoverStates().get(componentId) || false;
}
```

## Обработчики событий Drag & Drop

### 1. Начало перетаскивания

```typescript
onDragStarted(event: any) {
  this.isDragging.set(true);
  
  // Определяем источник
  const previousContainer = event.source?.dropContainer?.id;
  this.dragSource = previousContainer?.includes('sidebar') ? 'sidebar' : 'canvas';
  
  // Если из canvas - делаем полупрозрачным и фиксируем на месте
  if (this.dragSource === 'canvas') {
    const dragElement = event.source.element.nativeElement;
    dragElement.style.opacity = '0.5';
    dragElement.classList.add('dragging');
  }
  
  // Создаем компактный ghost элемент
  this.createDragGhost(event);
  this.hideCdkPreview();
  this.startPointerTracking();
}
```

### 2. Движение курсора

```typescript
onDragMoved(event: any) {
  this.updateDragGhostPosition(event);
  this.updateDropZones(event);
}
```

### 3. Завершение перетаскивания

```typescript
onDragEnded(event: any) {
  this.isDragging.set(false);
  
  // Восстанавливаем прозрачность
  if (this.dragSource === 'canvas') {
    const dragElement = event.source.element.nativeElement;
    dragElement.style.opacity = '';
    dragElement.classList.remove('dragging');
  }
  
  this.cleanupDragEffects();
  this.clearDropZones();
}
```

## Ключевые методы

### 1. Создание Ghost элемента

```typescript
public createDragGhost(event: any) {
  const draggedComponent = event.item?.data;
  if (!draggedComponent) return;

  this.dragGhost = document.createElement('div');
  this.dragGhost.className = 'drag-ghost-cursor';
  
  const componentType = typeof draggedComponent === 'string' ? draggedComponent : draggedComponent.type;
  const label = this.getComponentLabel(componentType);
  
  this.dragGhost.innerHTML = `
    <div class="drag-ghost-content">
      <div class="drag-ghost-icon">📦</div>
      <div class="drag-ghost-label">${label}</div>
    </div>
  `;
  
  document.body.appendChild(this.dragGhost);
}
```

### 2. Обновление Drop зон

```typescript
public updateDropZones(event: any) {
  const pointerEvent = event.event instanceof PointerEvent ? event.event : 
                      event.event?.originalEvent instanceof PointerEvent ? event.event.originalEvent : null;
  
  if (!pointerEvent) return;

  const elements = document.elementsFromPoint(pointerEvent.clientX, pointerEvent.clientY);
  this.clearDropZones();

  const targetComponent = this.findComponentUnderCursor(elements);
  
  if (targetComponent) {
    const position = this.calculateDropPosition(targetComponent, pointerEvent);
    if (position) {
      this.dropZones.update(zones => new Map(zones.set(targetComponent.id, position)));
      this.hoverStates.update(states => new Map(states.set(targetComponent.id, true)));
    }
  }
}
```

### 3. Определение позиции вставки

```typescript
public calculateDropPosition(component: DroppedComponent, event: PointerEvent): 'top' | 'bottom' | 'left' | 'right' | null {
  const element = document.querySelector(`[data-component-id="${component.id}"]`) as HTMLElement;
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const relativeX = event.clientX - centerX;
  const relativeY = event.clientY - centerY;
  
  if (Math.abs(relativeX) > Math.abs(relativeY)) {
    return relativeX > 0 ? 'right' : 'left';
  } else {
    return relativeY > 0 ? 'bottom' : 'top';
  }
}
```

## HTML структура

### 1. Основной контейнер

```html
<div class="editor-canvas"
     cdkDropList
     id="main-editor-list"
     [cdkDropListData]="components()"
     (cdkDropListDropped)="onDrop($event)"
     [class.drop-zone-hover]="isCanvasHovered()">
  
  <!-- Индикаторы для canvas -->
  <div class="drop-indicator drop-indicator-top" 
       [class.active]="canvasDropZone() === 'top'"></div>
  <div class="drop-indicator drop-indicator-bottom" 
       [class.active]="canvasDropZone() === 'bottom'"></div>
</div>
```

### 2. Компоненты с индикаторами

```html
<div cdkDrag
     [cdkDragData]="component"
     class="dropped-component component-drop-zone"
     (cdkDragStarted)="onDragStarted($event)"
     (cdkDragMoved)="onDragMoved($event)"
     (cdkDragEnded)="onDragEnded($event)"
     [attr.data-component-id]="component.id"
     [class.drop-zone-hover]="getHoverState(component.id)">
  
  <!-- Индикаторы drop зон -->
  <div class="drop-indicator drop-indicator-top" 
       [class.active]="getDropZone(component.id) === 'top'"></div>
  <div class="drop-indicator drop-indicator-bottom" 
       [class.active]="getDropZone(component.id) === 'bottom'"></div>
  <div class="drop-indicator drop-indicator-left" 
       [class.active]="getDropZone(component.id) === 'left'"></div>
  <div class="drop-indicator drop-indicator-right" 
       [class.active]="getDropZone(component.id) === 'right'"></div>

  <!-- Содержимое компонента -->
  <div class="component-preview">
    <!-- Превью компонента -->
  </div>
</div>
```

## CSS стили

### 1. Ghost элемент

```css
.drag-ghost-cursor {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  padding: 6px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 12px;
  min-width: 80px;
  max-width: 120px;
  text-align: center;
  transform: translate(10px, 10px);
}
```

### 2. Индикаторы drop зон

```css
.drop-indicator {
  position: absolute;
  background: #3b82f6;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 1000;
}

.drop-indicator.active {
  opacity: 1;
  animation: pulse-indicator 1s ease-in-out infinite alternate;
}

.component-drop-zone .drop-indicator-top {
  top: -2px;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 2px;
}

.component-drop-zone .drop-indicator-bottom {
  bottom: -2px;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 2px;
}

.component-drop-zone .drop-indicator-left {
  top: 0;
  left: -2px;
  bottom: 0;
  width: 4px;
  border-radius: 2px;
}

.component-drop-zone .drop-indicator-right {
  top: 0;
  right: -2px;
  bottom: 0;
  width: 4px;
  border-radius: 2px;
}
```

### 3. Полупрозрачность при перетаскивании

```css
.dropped-component.dragging {
  opacity: 0.5 !important;
  transition: opacity 0.2s ease;
  transform: none !important;
  position: static !important;
}
```

### 4. Скрытие CDK preview

```css
.cdk-drag-preview {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

.editor-canvas .cdk-drag-placeholder {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}
```

## Особенности поведения

### ⚠️ Важные моменты:

1. **Элемент остается на месте**: При захвате элемента из editor он становится полупрозрачным (opacity: 0.5) но НЕ сдвигается с места до момента отпускания мышки

2. **Компактный ghost**: С курсором двигается маленький прямоугольник как в sidebar с иконкой и названием компонента

3. **Голубые индикаторы**: При наведении на края любого элемента появляются голубые полоски (top/bottom/left/right), показывающие где будет вставлен элемент

4. **Точная вставка**: Элемент вставляется именно в позицию, указанную активным индикатором

5. **Отключение CDK эффектов**: Полностью скрыты стандартные CDK preview и placeholder элементы для чистого UX

6. **Анимация индикаторов**: Голубые полоски имеют пульсирующую анимацию для лучшей видимости

Эта архитектура обеспечивает интуитивный drag & drop интерфейс с точным позиционированием элементов.
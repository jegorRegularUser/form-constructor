import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-drag-drop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h3>🧪 Тест Drag-and-Drop исправлений</h3>
      
      <div class="test-section">
        <h4>✅ Горизонтальный контейнер (layout=row)</h4>
        <div class="test-container-row" data-droppable="true" data-layout="row">
          <div class="test-item">Элемент 1</div>
          <div class="test-item">Элемент 2</div>
          <div class="test-item">Элемент 3</div>
        </div>
        <p class="test-description">
          При перетаскивании должна появляться <strong>вертикальная</strong> синяя полоска слева/справа от элементов
        </p>
      </div>

      <div class="test-section">
        <h4>✅ Вертикальный контейнер (layout=column)</h4>
        <div class="test-container-column" data-droppable="true" data-layout="column">
          <div class="test-item">Элемент A</div>
          <div class="test-item">Элемент B</div>
          <div class="test-item">Элемент C</div>
        </div>
        <p class="test-description">
          При перетаскивании должна появляться <strong>горизонтальная</strong> синяя полоска сверху/снизу от элементов
        </p>
      </div>

      <div class="test-section">
        <h4>✅ Вложенные контейнеры</h4>
        <div class="test-container-column" data-droppable="true" data-layout="column">
          <div class="test-item">Внешний элемент</div>
          <div class="test-container-row nested" data-droppable="true" data-layout="row">
            <div class="test-item small">Вложенный 1</div>
            <div class="test-item small">Вложенный 2</div>
          </div>
          <div class="test-item">Еще внешний</div>
        </div>
        <p class="test-description">
          Система должна выбирать ближайший валидный контейнер по площади пересечения
        </p>
      </div>

      <div class="test-checklist">
        <h4>🎯 Чек-лист исправлений:</h4>
        <ul>
          <li>✅ Мини-плашка следует за курсором</li>
          <li>✅ Синяя полоска динамически позиционируется</li>
          <li>✅ Правильная ориентация полоски (горизонтальная/вертикальная)</li>
          <li>✅ Полупрозрачность при перемещении из canvas</li>
          <li>✅ Поддержка горизонтальных контейнеров</li>
          <li>✅ Вложенные контейнеры работают корректно</li>
          <li>✅ Автопрокрутка при приближении к краям</li>
          <li>✅ Полная очистка эффектов при отмене</li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    .test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .test-section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
    }

    .test-container-row {
      display: flex;
      flex-direction: row;
      gap: 10px;
      padding: 15px;
      border: 2px dashed #3b82f6;
      border-radius: 6px;
      background: white;
      min-height: 60px;
      align-items: center;
    }

    .test-container-column {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 15px;
      border: 2px dashed #10b981;
      border-radius: 6px;
      background: white;
      min-height: 120px;
    }

    .test-container-column.nested {
      border-color: #f59e0b;
      background: #fffbeb;
      margin: 10px 0;
    }

    .test-item {
      padding: 12px 16px;
      background: #3b82f6;
      color: white;
      border-radius: 4px;
      text-align: center;
      font-weight: 500;
      cursor: grab;
      user-select: none;
      transition: all 0.2s ease;
    }

    .test-item.small {
      padding: 8px 12px;
      font-size: 14px;
      background: #f59e0b;
    }

    .test-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .test-description {
      margin-top: 10px;
      font-size: 14px;
      color: #64748b;
      font-style: italic;
    }

    .test-checklist {
      margin-top: 40px;
      padding: 20px;
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
    }

    .test-checklist ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .test-checklist li {
      margin: 8px 0;
      color: #0f766e;
      font-weight: 500;
    }

    h3 {
      color: #1e293b;
      margin-bottom: 20px;
    }

    h4 {
      color: #334155;
      margin-bottom: 15px;
    }

    strong {
      color: #dc2626;
    }
  `
})
export class TestDragDropComponent {
  // Этот компонент служит для визуального тестирования исправлений
}
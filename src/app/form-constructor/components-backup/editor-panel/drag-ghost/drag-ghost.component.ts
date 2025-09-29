import { Component, Input, HostBinding, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CSS_CLASSES, DEFAULT_VALUES, COLORS } from '../../../constants/editor.constants';

@Component({
  selector: 'app-drag-ghost',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #blueStrip class="blue-insertion-strip" 
         [style.display]="showBlueStrip ? 'block' : 'none'" 
         [style.position]="'fixed'" 
         [style.zIndex]="'10000'" 
         [style.pointerEvents]="'none'"
         [style.backgroundColor]="'#3b82f6'"
         [style.borderRadius]="'2px'"
         [style.boxShadow]="'0 0 12px rgba(59, 130, 246, 0.8)'"
         [style.transition]="'all 0.1s ease'">
    </div>
    <div #miniPlaque class="mini-plaque" 
         [style.display]="showMiniPlaque ? 'flex' : 'none'"
         [style.position]="'fixed'"
         [style.transform]="'translate(-50%, -120%)'"
         [style.zIndex]="'10001'">
      <div class="mini-plaque-icon">{{ miniPlaqueIcon }}</div>
      <div class="mini-plaque-text">{{ miniPlaqueText }}</div>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      z-index: ${DEFAULT_VALUES.Z_INDEX_MAX};
      pointer-events: none;
      display: none;
    }

    .blue-insertion-strip {
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      opacity: 0.9;
    }
    
    .mini-plaque {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
      user-select: none;
    }
    
    .mini-plaque-icon {
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    
    .mini-plaque-text {
      font-size: 14px;
      font-weight: 500;
      color: #334155;
      white-space: nowrap;
      line-height: 1;
    }
  `
})
export class DragGhostComponent implements OnDestroy, AfterViewInit {
  @ViewChild('blueStrip') blueStrip!: ElementRef<HTMLDivElement>;
  @ViewChild('miniPlaque') miniPlaque!: ElementRef<HTMLDivElement>;
  
  @HostBinding('class') hostClass = CSS_CLASSES.DRAG_GHOST_CURSOR;
  @HostBinding('style.left') left: string = '0px';
  @HostBinding('style.top') top: string = '0px';
  @HostBinding('style.width') width: string = '200px';
  @HostBinding('style.display') display: string = 'none';
  
  private isHorizontal: boolean = true;
  private readonly STRIP_THICKNESS = 3; // px

  public showMiniPlaque: boolean = false;
  public showBlueStrip: boolean = false;
  public miniPlaqueIcon: string = '📝';
  public miniPlaqueText: string = 'Element';

  constructor() {}

  ngAfterViewInit(): void {
    // Initialize the strip
    this.updateOrientation();
  }

  ngOnDestroy(): void {
    // Clean up when component is destroyed
  }

  /**
   * Update position of the drag ghost
   */
  updatePosition(x: number, y: number): void {
    console.log('🎯 DragGhost updatePosition called with:', { x, y });
    // Make sure the positions are valid numbers
    if (!isNaN(x) && !isNaN(y)) {
      this.left = `${x}px`;
      this.top = `${y}px`;
      console.log('🎯 DragGhost position updated to:', { left: this.left, top: this.top });
    } else {
      console.error('🎯 DragGhost invalid position:', { x, y });
    }
  }

  /**
   * Update the blue insertion strip position (horizontal convenience wrapper)
   */
  updateInsertionStripPosition(containerRect: DOMRect, position: number, size: number, orientation: 'horizontal' | 'vertical'): void {
    if (orientation === 'horizontal') {
      // Horizontal line across container
      const left = containerRect.left + 16;
      const height = this.STRIP_THICKNESS;
      this.updateInsertionStripRect(left, position, size, height);
    } else {
      // Vertical line in container
      const top = containerRect.top + 16;
      const width = this.STRIP_THICKNESS;
      this.updateInsertionStripRect(position, top, width, size);
    }
  }

  /**
   * Update the blue insertion strip by explicit rect (supports vertical/horizontal)
   */
  updateInsertionStripRect(left: number, top: number, width: number, height: number): void {
    if (!this.blueStrip) {
      console.error('🎯 Blue insertion strip element not found');
      return;
    }

    if ([left, top, width, height].some(v => isNaN(v) || v < 0)) {
      console.error('🎯 Invalid insertion strip rect:', { left, top, width, height });
      return;
    }

    const el = this.blueStrip.nativeElement;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${Math.max(1, width)}px`;
    el.style.height = `${Math.max(1, height)}px`;
    
    // Ensure visibility
    el.style.display = 'block';
    el.style.opacity = '0.9';
  }

  /**
   * Set the container for the blue insertion strip (ensures proper positioning)
   */
  setInsertionStripContainer(container: HTMLElement): void {
    // Blue strip uses fixed positioning, so no need to move it
    // This method is kept for compatibility
  }

  /**
   * Update the width of the insertion strip
   */
  updateWidth(width: number): void {
    this.width = `${width}px`;
  }

  /**
   * Set the orientation of the insertion strip
   */
  setOrientation(orientation: 'horizontal' | 'vertical'): void {
    this.isHorizontal = orientation === 'horizontal';
    this.updateOrientation();
  }

  /**
   * Show or hide the drag ghost
   */
  setVisible(visible: boolean): void {
    this.display = visible ? 'block' : 'none';
  }

  /**
   * Show or hide the mini plaque
   */
  setMiniPlaqueVisible(visible: boolean): void {
    this.showMiniPlaque = visible;
  }

  /**
   * Show or hide the blue insertion strip
   */
  setBlueStripVisible(visible: boolean): void {
    this.showBlueStrip = visible;
    if (this.blueStrip) {
      this.blueStrip.nativeElement.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Set the mini plaque content
   */
  setMiniPlaqueContent(icon: string, text: string): void {
    this.miniPlaqueIcon = icon;
    this.miniPlaqueText = text;
  }

  /**
   * Update the mini plaque position to follow cursor
   */
  updateMiniPlaquePosition(x: number, y: number): void {
    if (this.miniPlaque && !isNaN(x) && !isNaN(y)) {
      // Position with slight offset to avoid cursor overlap
      this.miniPlaque.nativeElement.style.left = `${x + 10}px`;
      this.miniPlaque.nativeElement.style.top = `${y - 30}px`;
      this.miniPlaque.nativeElement.style.display = 'flex';
    }
  }

  /**
   * Update the orientation of the strip
   */
  private updateOrientation(): void {
    if (this.blueStrip) {
      const el = this.blueStrip.nativeElement;
      if (this.isHorizontal) {
        // Horizontal line (for column layout)
        el.style.height = `${this.STRIP_THICKNESS}px`;
        el.style.minHeight = `${this.STRIP_THICKNESS}px`;
      } else {
        // Vertical line (for row layout)
        el.style.width = `${this.STRIP_THICKNESS}px`;
        el.style.minWidth = `${this.STRIP_THICKNESS}px`;
      }
    }
  }

  /**
   * Reset all visual elements
   */
  reset(): void {
    this.setVisible(false);
    this.setMiniPlaqueVisible(false);
    this.setBlueStripVisible(false);
  }
}
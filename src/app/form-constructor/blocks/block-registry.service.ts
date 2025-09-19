/**
 * Block Registry Service - Manages all custom GrapesJS blocks
 */

import { Injectable } from '@angular/core';
import { registerInputFieldBlock } from './input-blocks/input-field.block';
import { registerSelectFieldBlock } from './input-blocks/select-field.block';
import { registerCheckboxFieldBlock } from './input-blocks/checkbox-field.block';
import { registerButtonBlock } from './form-blocks/button.block';
import { registerContainerBlock } from './container-blocks/container.block';

export interface BlockCategory {
  id: string;
  name: string;
  order: number;
  blocks: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BlockRegistryService {
  private registeredBlocks = new Map<string, any>();
  private categories: BlockCategory[] = [
    {
      id: 'form-elements',
      name: 'Form Elements',
      order: 1,
      blocks: ['angular-input-field', 'angular-select-field', 'angular-checkbox-field']
    },
    {
      id: 'layout',
      name: 'Layout',
      order: 2,
      blocks: ['angular-container']
    },
    {
      id: 'actions',
      name: 'Actions',
      order: 3,
      blocks: ['angular-button']
    }
  ];

  /**
   * Register all custom blocks with GrapesJS editor
   */
  registerAllBlocks(editor: any): void {
    console.log('Registering custom Angular blocks...');
    
    try {
      // Register form input blocks
      registerInputFieldBlock(editor);
      registerSelectFieldBlock(editor);
      registerCheckboxFieldBlock(editor);
      
      // Register action blocks
      registerButtonBlock(editor);
      
      // Register layout blocks
      registerContainerBlock(editor);
      
      // Store references
      this.registeredBlocks.set('angular-input-field', registerInputFieldBlock);
      this.registeredBlocks.set('angular-select-field', registerSelectFieldBlock);
      this.registeredBlocks.set('angular-checkbox-field', registerCheckboxFieldBlock);
      this.registeredBlocks.set('angular-button', registerButtonBlock);
      this.registeredBlocks.set('angular-container', registerContainerBlock);
      
      console.log(`Successfully registered ${this.registeredBlocks.size} custom blocks`);
      
    } catch (error) {
      console.error('Failed to register blocks:', error);
      throw error;
    }
  }

  /**
   * Get all block categories for UI display
   */
  getCategories(): BlockCategory[] {
    return this.categories.sort((a, b) => a.order - b.order);
  }

  /**
   * Get blocks by category
   */
  getBlocksByCategory(categoryId: string): string[] {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.blocks : [];
  }

  /**
   * Add a new custom block
   */
  addCustomBlock(blockId: string, registrationFunction: (editor: any) => void): void {
    this.registeredBlocks.set(blockId, registrationFunction);
  }

  /**
   * Remove a custom block
   */
  removeCustomBlock(blockId: string): void {
    this.registeredBlocks.delete(blockId);
  }

  /**
   * Check if a block is registered
   */
  isBlockRegistered(blockId: string): boolean {
    return this.registeredBlocks.has(blockId);
  }

  /**
   * Get total number of registered blocks
   */
  getBlockCount(): number {
    return this.registeredBlocks.size;
  }

  /**
   * Register additional blocks for specific use cases
   */
  registerAdvancedBlocks(editor: any): void {
    // This method can be used later to add more complex blocks
    // like file uploads, date pickers, rich text editors, etc.
    console.log('Advanced blocks registration placeholder');
  }

  /**
   * Validate block definitions
   */
  validateBlocks(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for duplicate block IDs
    const blockIds = new Set();
    this.registeredBlocks.forEach((_, blockId) => {
      if (blockIds.has(blockId)) {
        errors.push(`Duplicate block ID: ${blockId}`);
      }
      blockIds.add(blockId);
    });

    // Check category consistency
    this.categories.forEach(category => {
      category.blocks.forEach(blockId => {
        if (!this.registeredBlocks.has(blockId)) {
          errors.push(`Block ${blockId} referenced in category ${category.name} but not registered`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
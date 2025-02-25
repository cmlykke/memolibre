// src/app/load-user-data/load-user-data.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashCardDeck } from '../businesslogic/models/flashcarddeck';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { TooltipDirective } from '../tooltip.directive'; // Import the directive

@Component({
  selector: 'app-load-user-data',
  imports: [CommonModule, TooltipDirective], // Add TooltipDirective to imports
  templateUrl: './load-user-data.component.html',
  styleUrl: './load-user-data.component.css',
  standalone: true,
})
export class LoadUserDataComponent {
  fileName: string | null = null;

  constructor(private globalStateService: GlobalStateService) {}

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileContent = reader.result as string;
        const parsedData: FlashCardDeck = JSON.parse(fileContent);
        if (this.isValidFlashCardDeck(parsedData)) {
          this.fileName = `File Loaded: ${file.name}`;
          console.log('Parsed FlashCardDeck:', parsedData);
          this.globalStateService.setFlashCardDeck(parsedData);
        } else {
          this.fileName = `Error: File is not of type FlashCardDeck`;
        }
      } catch (error) {
        console.error('Error reading or parsing the file:', error);
        this.fileName = `Error: Could not parse the file as JSON.`;
      }
    };
    reader.onerror = () => {
      this.fileName = `Error: Failed to read file ${file.name}`;
    };
    reader.readAsText(file);
  }

  private isValidFlashCardDeck(data: any): data is FlashCardDeck {
    return (
      typeof data.deckName === 'string' &&
      typeof data.deckInfo === 'string' &&
      typeof data.settings === 'object' &&
      typeof data.tags === 'object' &&
      Array.isArray(data.cards)
    );
  }

  downloadFlashCardDeck(): void {
    const flashCardDeck = this.globalStateService.getFlashCardDeck();
    if (!flashCardDeck) {
      console.error('No FlashCardDeck available to download.');
      return;
    }
    const json = JSON.stringify(flashCardDeck, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${flashCardDeck.deckName || 'FlashCardDeck'}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    this.fileName = `Download successful: ${flashCardDeck.deckName || 'FlashCardDeck'}.json`;
  }
}

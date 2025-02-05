import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FlashCardDeck } from '../businesslogic/models/flashcarddeck';
import { GlobalStateService } from '../angular/shared/services/global-state-service'; // Update the path as needed

@Component({
  selector: 'app-load-user-data',
  imports: [CommonModule],
  templateUrl: './load-user-data.component.html',
  styleUrl: './load-user-data.component.css',
  standalone: true,
})
export class LoadUserDataComponent {
  fileName: string | null = null; // Variable to store the name of the file
  constructor(private globalStateService: GlobalStateService) {}

  // Handles the drop event
  onFileDrop(event: DragEvent): void {
    event.preventDefault(); // Prevent default browser behavior
    event.stopPropagation(); // Stop the event from propagating further

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file); // Use unified function
    }
  }

  // Prevent the browser's default behavior when dragging over the drop zone
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Method to handle file selection using the button
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.handleFile(file); // Use unified function
    }
  }


  handleFile(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileContent = reader.result as string; // Get the file content as a string
        const parsedData: FlashCardDeck = JSON.parse(fileContent); // Attempt to parse the JSON

        // Validate if parsed data matches expected structure
        if (this.isValidFlashCardDeck(parsedData)) {
          this.fileName = `File Loaded: ${file.name}`; // Indicate success
          console.log('Parsed FlashCardDeck:', parsedData); // Log the parsed object if needed

          // Save the parsed FlashCardDeck to global state
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
      console.error('Error reading the file.');
    };

    reader.readAsText(file); // Read the file as text
  }


// Helper method to validate if the parsed object matches FlashCardDeck structure
  private isValidFlashCardDeck(data: any): data is FlashCardDeck {
    return (
      typeof data.deckName === 'string' &&
      typeof data.deckInfo === 'string' &&
      typeof data.settings === 'object' &&
      typeof data.tags === 'object' &&
      Array.isArray(data.cards)
    );
  }

}

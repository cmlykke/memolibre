import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-load-user-data',
  imports: [CommonModule],
  templateUrl: './load-user-data.component.html',
  styleUrl: './load-user-data.component.css',
  standalone: true,
})
export class LoadUserDataComponent {
  fileName: string | null = null; // Variable to store the name of the file

  // Handles the drop event
  onFileDrop(event: DragEvent): void {
    event.preventDefault(); // Prevent default browser behavior
    event.stopPropagation(); // Stop the event from propagating further

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.fileName = file.name; // Store the name of the file
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
      this.fileName = file.name; // Update the fileName
    }
  }

}

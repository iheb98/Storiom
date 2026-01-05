import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompressorService } from 'src/app/core/services/compressor.service';
import { FileService } from 'src/app/core/services/file.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment.prod';

export interface DialogData {
  name: string;
  image?: string;
  icon?: string;
}

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent {
  categoryData: DialogData;
  environment = environment;
  // Image upload
  selectedFile: { file: File, preview: string } | null = null;
  isUploading = false;
  uploadError = '';

  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private compressor: CompressorService,
    private fileService: FileService,
    private authService: AuthService
  ) {
    // Initialize with existing data or empty values
    this.categoryData = {
      name: data?.name || '',
      image: data?.image || '',
      icon: data?.icon || ''
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Veuillez sélectionner une image';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedFile = {
        file: file,
        preview: e.target.result
      };
      this.uploadError = '';
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.categoryData.image = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  submit(): void {
    if (!this.categoryData.name) return;

    // If there's a new file to upload
    if (this.selectedFile) {
      this.isUploading = true;
      this.uploadError = '';

      // Compress the image
      this.compressor.compress(this.selectedFile.file, 800, 0.85).subscribe({
        next: (compressedFile: File) => {
          // Generate filename
          const userId = this.authService.getConnectedUser()?.id || 'user';
          const timestamp = new Date().getTime();
          const fileName = `category-${userId}-${timestamp}.webp`;

          // Upload the compressed file
          const formData = new FormData();
          formData.append('file', compressedFile, fileName);

          this.fileService.uploadMultiple(formData).subscribe({
            next: (response: any) => {
              // Get the uploaded file path
              if (response.files && response.files.length > 0) {
                this.categoryData.image = response.files[0].location.split('/').pop();
              }
              this.isUploading = false;
              this.dialogRef.close(this.categoryData);
            },
            error: (err) => {
              this.isUploading = false;
              this.uploadError = 'Erreur lors du téléchargement';
              console.error('Upload error:', err);
            }
          });
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadError = 'Erreur lors de la compression';
          console.error('Compression error:', err);
        }
      });
    } else {
      // No new file, just close with current data
      this.dialogRef.close(this.categoryData);
    }
  }
}

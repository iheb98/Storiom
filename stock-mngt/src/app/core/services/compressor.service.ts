import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompressorService {
  constructor() { }

  compress(file: File, maxWidth: number = 800, quality: number = 0.85): Observable<File> {
    const reader = new FileReader();

    return new Observable(observer => {
      reader.onload = ev => {
        const img = new Image();
        img.src = (ev.target as any).result;

        img.onload = () => {
          const elem = document.createElement('canvas');

          // Calculate dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            const scaleFactor = maxWidth / width;
            width = maxWidth;
            height = height * scaleFactor;
          }

          elem.width = width;
          elem.height = height;

          const ctx = <CanvasRenderingContext2D>elem.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP format for smaller file size
          ctx.canvas.toBlob(
            blob => {
              if (blob) {
                // Change extension to .webp
                const originalName = file.name.replace(/\.[^/.]+$/, '');
                observer.next(
                  new File([blob], `${originalName}.webp`, {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  }),
                );
                observer.complete();
              } else {
                observer.error('Failed to convert image to WebP');
              }
            },
            'image/webp',
            quality,
          );
        };

        img.onerror = error => observer.error('Failed to load image');
      };

      reader.onerror = error => observer.error(error);
      reader.readAsDataURL(file);
    });
  }
}

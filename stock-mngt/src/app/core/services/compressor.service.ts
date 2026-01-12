import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompressorService {
  constructor() { }

  compress(file: File, maxWidth: number = 800, quality: number = 0.85): Observable<File> {
    return new Observable(observer => {
      // Check if file is valid
      if (!file || file.size === 0) {
        console.warn('Invalid file, returning original');
        observer.next(file);
        observer.complete();
        return;
      }

      // Retry logic for mobile file access issues
      this.compressWithRetry(file, maxWidth, quality, 3).then(
        result => {
          observer.next(result);
          observer.complete();
        }
      ).catch(err => {
        console.error('All compression attempts failed:', err);
        // Final fallback: return original file
        observer.next(file);
        observer.complete();
      });
    });
  }

  private async compressWithRetry(file: File, maxWidth: number, quality: number, maxRetries: number): Promise<File> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Small delay between retries to let file handle stabilize
        if (attempt > 1) {
          await this.delay(500 * attempt); // 500ms, 1000ms, 1500ms delays
          console.log(`Compression retry attempt ${attempt}/${maxRetries}...`);
        }

        const result = await this.compressOnce(file, maxWidth, quality);
        return result;
      } catch (err) {
        lastError = err;
        console.warn(`Compression attempt ${attempt} failed:`, err);
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private compressOnce(file: File, maxWidth: number, quality: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let hasCompleted = false;

      // Timeout for mobile file reading issues
      const fileReadTimeout = setTimeout(() => {
        if (!hasCompleted) {
          hasCompleted = true;
          reject(new Error('FileReader timeout'));
        }
      }, 15000); // 15 second timeout

      reader.onload = ev => {
        if (hasCompleted) return;
        clearTimeout(fileReadTimeout);

        const img = new Image();
        img.src = (ev.target as any).result;

        // Image load timeout
        const imgTimeout = setTimeout(() => {
          if (!hasCompleted) {
            hasCompleted = true;
            reject(new Error('Image load timeout'));
          }
        }, 10000);

        img.onload = () => {
          if (hasCompleted) return;
          clearTimeout(imgTimeout);

          try {
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
                if (hasCompleted) return;
                hasCompleted = true;

                if (blob) {
                  const originalName = file.name.replace(/\.[^/.]+$/, '');
                  resolve(
                    new File([blob], `${originalName}.webp`, {
                      type: 'image/webp',
                      lastModified: Date.now(),
                    })
                  );
                } else {
                  reject(new Error('Blob creation failed'));
                }
              },
              'image/webp',
              quality,
            );
          } catch (e) {
            if (hasCompleted) return;
            hasCompleted = true;
            reject(e);
          }
        };

        img.onerror = error => {
          if (hasCompleted) return;
          hasCompleted = true;
          clearTimeout(imgTimeout);
          reject(new Error('Image load failed'));
        };
      };

      reader.onerror = error => {
        if (hasCompleted) return;
        hasCompleted = true;
        clearTimeout(fileReadTimeout);
        reject(error);
      };

      try {
        reader.readAsDataURL(file);
      } catch (e) {
        if (hasCompleted) return;
        hasCompleted = true;
        clearTimeout(fileReadTimeout);
        reject(e);
      }
    });
  }
}

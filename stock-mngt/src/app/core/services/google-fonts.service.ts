import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GoogleFontsService {
  private loadedFonts = new Set<string>();

  /**
   * Load a single Google Font by injecting a <link> into <head>.
   * Skips if already loaded.
   */
  loadFont(fontFamily: string): void {
    if (!fontFamily || this.loadedFonts.has(fontFamily)) return;

    const formattedName = fontFamily.replace(/\s+/g, '+');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
    this.loadedFonts.add(fontFamily);
  }

  /**
   * Load multiple Google Fonts at once.
   */
  loadFonts(fontFamilies: string[]): void {
    if (!fontFamilies?.length) return;

    const newFonts = fontFamilies.filter(f => f && !this.loadedFonts.has(f));
    if (newFonts.length === 0) return;

    // Use a single request for all fonts (more efficient)
    const families = newFonts.map(f => `family=${f.replace(/\s+/g, '+')}:wght@300;400;500;600;700`).join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);

    newFonts.forEach(f => this.loadedFonts.add(f));
  }
}

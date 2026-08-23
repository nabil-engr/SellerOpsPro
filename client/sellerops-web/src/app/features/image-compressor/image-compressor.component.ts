import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-image-compressor',
  standalone: true,
  imports: [FormsModule],
  template: `<section class="calculator card">
    <div class="calculator-header">
      <div>
        <span class="eyebrow">Private browser utility</span>
        <h2>Compress a product image</h2>
      </div>
      <span class="pill">Local only</span>
    </div>
    <div class="field-grid">
      <label class="field"
        ><span>Image file</span
        ><input type="file" accept="image/jpeg,image/png,image/webp" (change)="onFile($event)"
      /></label>
      <label class="field"
        ><span>Output format</span
        ><select [(ngModel)]="format">
          <option value="image/webp">WebP</option>
          <option value="image/jpeg">JPEG</option>
        </select></label
      >
      <label class="field"
        ><span>Quality: {{ quality }}%</span
        ><input type="range" min="35" max="95" step="5" [(ngModel)]="quality"
      /></label>
    </div>
    <button
      class="button top-gap"
      type="button"
      (click)="compress()"
      [disabled]="!file || processing"
    >
      {{ processing ? 'Compressing…' : 'Compress image' }}
    </button>
    <p class="microcopy">
      The selected image stays in your browser and is not uploaded. JPEG, PNG or WebP up to 20 MB.
    </p>
    @if (error) {
      <div class="alert alert-error" role="alert">{{ error }}</div>
    }
    @if (outputUrl) {
      <div class="image-result">
        <img [src]="outputUrl" alt="Compressed preview" />
        <div>
          <h3>Compressed file ready</h3>
          <p>
            Original: {{ formatBytes(originalBytes) }} • Compressed: {{ formatBytes(outputBytes) }}
          </p>
          <p>Size change: {{ sizeChange }}</p>
          <a class="button button-secondary" [href]="outputUrl" [download]="downloadName"
            >Download compressed image</a
          >
        </div>
      </div>
    }
  </section>`,
})
export class ImageCompressorComponent implements OnDestroy {
  private static readonly maxFileBytes = 20 * 1024 * 1024;
  private static readonly maxPixels = 24_000_000;
  protected file?: File;
  protected format = 'image/webp';
  protected quality = 80;
  protected processing = false;
  protected outputUrl = '';
  protected originalBytes = 0;
  protected outputBytes = 0;
  protected reduction = 0;
  protected downloadName = 'sellerops-compressed.webp';
  protected error = '';
  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.file = undefined;
    this.originalBytes = 0;
    this.error = '';
    this.revoke();
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.error = 'Choose a JPEG, PNG or WebP image.';
      input.value = '';
      return;
    }
    if (file.size > ImageCompressorComponent.maxFileBytes) {
      this.error = 'Choose an image smaller than 20 MB.';
      input.value = '';
      return;
    }
    this.file = file;
    this.originalBytes = file.size;
  }
  protected async compress(): Promise<void> {
    if (!this.file || this.processing) return;
    this.error = '';
    this.processing = true;
    try {
      if (typeof createImageBitmap === 'undefined')
        throw new Error('This browser does not support local image compression.');
      const bitmap = await createImageBitmap(this.file);
      if (bitmap.width * bitmap.height > ImageCompressorComponent.maxPixels) {
        bitmap.close();
        throw new Error('This image has too many pixels. Use an image smaller than 24 megapixels.');
      }
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        throw new Error('Canvas is unavailable.');
      }
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (v) => (v ? resolve(v) : reject(new Error('Compression failed.'))),
          this.format,
          this.quality / 100,
        ),
      );
      this.revoke();
      this.outputUrl = URL.createObjectURL(blob);
      this.outputBytes = blob.size;
      this.reduction = this.originalBytes
        ? Math.round((1 - blob.size / this.originalBytes) * 100)
        : 0;
      this.downloadName = `sellerops-compressed.${this.format === 'image/webp' ? 'webp' : 'jpg'}`;
    } catch (e: unknown) {
      this.error = e instanceof Error ? e.message : 'Image compression failed.';
    } finally {
      this.processing = false;
    }
  }
  protected formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  protected get sizeChange(): string {
    return this.reduction >= 0
      ? `${this.reduction}% smaller`
      : `${Math.abs(this.reduction)}% larger`;
  }
  private revoke(): void {
    if (this.outputUrl && typeof URL !== 'undefined') URL.revokeObjectURL(this.outputUrl);
    this.outputUrl = '';
  }
  ngOnDestroy(): void {
    this.revoke();
  }
}

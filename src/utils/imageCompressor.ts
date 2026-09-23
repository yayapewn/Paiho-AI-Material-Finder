export interface CompressionResult {
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

/**
 * Resizes image so maximum long edge is 1600px and compresses with JPEG quality ~0.8.
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return reject(
        new Error('不支援的圖片格式。請使用 JPG, PNG 或 WEBP 格式。')
      );
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('讀取圖片檔案失敗。'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('無法載入圖片進行縮圖處理。'));
      img.onload = () => {
        const maxEdge = 1600;
        let { width, height } = img;

        if (width > maxEdge || height > maxEdge) {
          if (width > height) {
            height = Math.round((height * maxEdge) / width);
            width = maxEdge;
          } else {
            width = Math.round((width * maxEdge) / height);
            height = maxEdge;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('瀏覽器不支援 Canvas 圖像處理。'));
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const quality = 0.8;
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSize = Math.round((compressedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: approxSize,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Procesado de imagen client-side: redimensiona al lado largo máximo
 * indicado y exporta JPEG comprimido. Devuelve también las dimensiones
 * finales para guardarlas en la base de datos.
 */

type ProcessOptions = {
  /** Tamaño máximo del lado largo en píxeles. Default 2400. */
  maxDimension?: number;
  /** Calidad JPEG entre 0 y 1. Default 0.88. */
  quality?: number;
};

type ProcessResult = {
  blob: Blob;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function processImage(
  file: File,
  options: ProcessOptions = {},
): Promise<ProcessResult> {
  const { maxDimension = 2400, quality = 0.88 } = options;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);

    // Calcular dimensiones finales preservando aspect ratio
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    const longEdge = Math.max(width, height);
    if (longEdge > maxDimension) {
      const scale = maxDimension / longEdge;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    // Renderizar al canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear el canvas.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // Exportar JPEG
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Falló la exportación."))),
        "image/jpeg",
        quality,
      );
    });

    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

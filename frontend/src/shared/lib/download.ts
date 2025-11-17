export function download(
  fileContent: string | Record<number, number> | Uint8Array | undefined,
  fileName = "file"
) {
  if (!fileContent) {
    console.error("Файл не найден");
    return;
  }

  try {
    let uint8: Uint8Array;

    // Обработка разных форматов входных данных
    if (typeof fileContent === "string") {
      // Если пришла base64 строка
      const byteCharacters = atob(fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      uint8 = new Uint8Array(byteNumbers);
    } else if (fileContent instanceof Uint8Array) {
      // Если уже Uint8Array
      uint8 = fileContent;
    } else if (typeof fileContent === "object") {
      // Если объект с числовыми ключами {0: 80, 1: 75, ...}
      const keys = Object.keys(fileContent)
        .map(Number)
        .filter((k) => !isNaN(k))
        .sort((a, b) => a - b);

      const byteArray = keys.map((key) => fileContent[key]);
      uint8 = new Uint8Array(byteArray);
    } else {
      console.error("Неверный формат данных файла");
      return;
    }

    // Определение MIME типа по сигнатуре файла
    const detectMimeType = (bytes: Uint8Array): string => {
      if (bytes.length < 8) return "application/octet-stream";

      const hex = Array.from(bytes.slice(0, 8))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

      // PDF
      if (hex.startsWith("25504446")) return "application/pdf";

      // Изображения
      if (hex.startsWith("89504E47")) return "image/png";
      if (hex.startsWith("FFD8FF")) return "image/jpeg";
      if (hex.startsWith("47494638")) return "image/gif";

      // Старые форматы Office
      if (hex.startsWith("D0CF11E0")) return "application/msword";

      // XML
      if (hex.startsWith("3C3F786D")) return "text/xml";

      // ZIP и Office Open XML форматы (DOCX, XLSX, PPTX)
      if (hex.startsWith("504B0304") || hex.startsWith("504B0506")) {
        try {
          // Пытаемся определить тип по содержимому архива
          const text = new TextDecoder("utf-8", { fatal: false }).decode(
            bytes.slice(0, Math.min(5000, bytes.length))
          );

          if (text.includes("word/")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          }
          if (text.includes("xl/")) {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          }
          if (text.includes("ppt/")) {
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
          }
        } catch (e) {
          console.warn("Не удалось декодировать содержимое ZIP:", e);
        }
        return "application/zip";
      }

      // Текстовые форматы
      if (hex.startsWith("EFBBBF")) return "text/plain"; // UTF-8 BOM

      return "application/octet-stream";
    };

    const mimeType = detectMimeType(uint8);

    // Маппинг MIME типов к расширениям
    const mimeToExt: Record<string, string> = {
      "application/pdf": "pdf",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "application/msword": "doc",
      "text/xml": "xml",
      "text/plain": "txt",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx",
      "application/zip": "zip",
      "application/octet-stream": "bin",
    };

    const ext = mimeToExt[mimeType] || "bin";

    // Формируем имя файла
    const finalName = fileName.includes(".") ? fileName : `${fileName}.${ext}`;

    // Создаем Blob и скачиваем
    const blob = new Blob([uint8.slice()], { type: mimeType });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = finalName;

    // Добавляем в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();

    // Очищаем
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 100);

    console.log(
      `Файл "${finalName}" успешно скачан (${uint8.length} байт, тип: ${mimeType})`
    );
  } catch (e) {
    console.error("Ошибка при скачивании файла:", e);
    alert("Не удалось скачать файл. Проверьте консоль для деталей.");
  }
}

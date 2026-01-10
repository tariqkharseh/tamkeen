/**
 * Dynamically loads QCF fonts based on page number
 * Fonts are named QCF_P{pageNumber}.TTF
 */


export const getFontNameForPage = (pageNum: number) => {
  if (pageNum >= 1 && pageNum <= 9) {
    return `QCF_P00${pageNum}`;
  } else if (pageNum >= 10 && pageNum <= 99) {
    return `QCF_P0${pageNum}`;
  } else {
    return `QCF_P${pageNum}`;
  }
};


export function getFontPathForPage(pageNumber: number): string {
  // Fonts are served via API route from app/fonts
  return `/api/fonts/${pageNumber}`;
}

/**
 * Loads a font dynamically by creating a @font-face rule
 */
export function loadFontForPage(pageNumber: number): void {
  const fontName = getFontNameForPage(pageNumber);
  const fontPath = getFontPathForPage(pageNumber);

  // Check if font is already loaded
  if (document.fonts.check(`16px "${fontName}"`)) {
    return;
  }

  // Create style element if it doesn't exist
  let styleElement = document.getElementById(`font-${pageNumber}`);
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = `font-${pageNumber}`;
    document.head.appendChild(styleElement);
  }

  // Add @font-face rule
  const fontFace = `
    @font-face {
      font-family: "${fontName}";
      src: url("${fontPath}") format("truetype");
      font-display: swap;
    }
  `;

  styleElement.textContent = fontFace;
}

/**
 * Gets the CSS font-family value for a given page
 */
export function getFontFamilyForPage(pageNumber: number): string {
  const fontName = getFontNameForPage(pageNumber);
  loadFontForPage(pageNumber);
  return fontName;
}


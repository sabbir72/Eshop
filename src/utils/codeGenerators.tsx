import React from "react";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Generates a clean Code128 / Code39 style visual barcode SVG vector.
 */
export const BarcodeSVG: React.FC<BarcodeProps> = ({
  value,
  width = 160,
  height = 40,
  className = "",
}) => {
  // Simple deterministic pseudo-bar pattern generator based on string char codes
  const str = value || "DOC-0000";
  const bars: { x: number; w: number; isBlack: boolean }[] = [];
  let currentX = 5;

  // Start quiet zone & start bar
  bars.push({ x: currentX, w: 2, isBlack: true }); currentX += 3;
  bars.push({ x: currentX, w: 1, isBlack: false }); currentX += 2;
  bars.push({ x: currentX, w: 3, isBlack: true }); currentX += 4;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const b1 = (code % 3) + 1;
    const s1 = ((code >> 1) % 2) + 1;
    const b2 = ((code >> 2) % 3) + 1;
    const s2 = ((code >> 3) % 2) + 1;

    bars.push({ x: currentX, w: b1, isBlack: true }); currentX += b1 + s1;
    bars.push({ x: currentX, w: b2, isBlack: true }); currentX += b2 + s2;
  }

  // Stop pattern
  bars.push({ x: currentX, w: 3, isBlack: true }); currentX += 4;
  bars.push({ x: currentX, w: 1, isBlack: false }); currentX += 2;
  bars.push({ x: currentX, w: 2, isBlack: true }); currentX += 3;

  const totalWidth = currentX + 5;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full h-auto max-h-[48px]"
        preserveAspectRatio="none"
      >
        <rect width={totalWidth} height={height} fill="#FFFFFF" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={2}
            width={bar.w}
            height={height - 4}
            fill={bar.isBlack ? "#000000" : "#FFFFFF"}
          />
        ))}
      </svg>
      <span className="text-[9px] font-mono font-bold tracking-widest text-slate-800 mt-0.5">
        *{value}*
      </span>
    </div>
  );
};

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Generates a clean 2D QR Code SVG vector pattern with finder patterns at 3 corners.
 */
export const QRCodeSVG: React.FC<QRCodeProps> = ({
  value,
  size = 64,
  className = "",
}) => {
  const str = value || "DOC-0000";
  const matrixSize = 21; // Standard Version 1 QR matrix 21x21
  const grid: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(false)
  );

  // Helper to draw 7x7 Finder Pattern
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startY + r][startX + c] = true;
        }
      }
    }
  };

  // Top-left, Top-right, Bottom-left finders
  drawFinder(0, 0);
  drawFinder(14, 0);
  drawFinder(0, 14);

  // Timing patterns
  for (let i = 8; i < 13; i += 2) {
    grid[6][i] = true;
    grid[i][6] = true;
  }

  // Populate remainder of matrix based on hash of input string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite finders
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c > 12) ||
        (r > 12 && c < 8)
      ) {
        continue;
      }
      const bit = ((hash ^ (r * 31 + c * 17)) & 1) === 1;
      grid[r][c] = bit;
    }
  }

  return (
    <div className={`inline-block ${className}`}>
      <svg
        viewBox={`0 0 ${matrixSize} ${matrixSize}`}
        width={size}
        height={size}
        className="rounded-xs border border-slate-300 bg-white p-1"
      >
        <rect width={matrixSize} height={matrixSize} fill="#FFFFFF" />
        {grid.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#000000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};

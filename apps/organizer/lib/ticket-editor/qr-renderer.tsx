import React from "react";

interface QrRendererProps {
  value: string;
  size?: number;
  colorDark?: string;
  colorLight?: string;
  includeMargin?: boolean;
  className?: string;
}

/** Simple deterministic pseudo-random matrix generator for ticket preview display */
function generatePreviewQrMatrix(value: string, moduleCount = 29): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));

  // Add standard Finder Patterns at 3 corners
  const addFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  addFinder(0, 0); // Top-left
  addFinder(moduleCount - 7, 0); // Top-right
  addFinder(0, moduleCount - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Fill data modules deterministically using simple hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= moduleCount - 8;
      const inBottomLeft = r >= moduleCount - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      const seed = Math.sin(r * 31 + c * 17 + hash) * 10000;
      matrix[r][c] = seed - Math.floor(seed) > 0.45;
    }
  }

  return matrix;
}

export const QrRenderer: React.FC<QrRendererProps> = ({
  value,
  size = 160,
  colorDark = "#000000",
  colorLight = "#ffffff",
  includeMargin = true,
  className = "",
}) => {
  const moduleCount = 29;
  const matrix = React.useMemo(() => generatePreviewQrMatrix(value, moduleCount), [value]);
  const margin = includeMargin ? 2 : 0;
  const viewBoxSize = moduleCount + margin * 2;

  const rects: React.ReactNode[] = [];
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        rects.push(<rect key={`${r}-${c}`} x={c + margin} y={r + margin} width={1} height={1} fill={colorDark} />);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={`size-full ${className}`}
      style={{ backgroundColor: colorLight }}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill={colorLight} />
      {rects}
    </svg>
  );
};

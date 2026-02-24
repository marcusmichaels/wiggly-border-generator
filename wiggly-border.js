/**
 * Wiggly Border Generator
 *
 * Generates organic, hand-drawn style SVG borders that scale with their container.
 *
 * Strategy:
 * 1. Use a dynamic viewBox that matches the aspect ratio of the target dimensions
 * 2. Calculate segment counts based on actual edge lengths for uniform wave density
 * 3. Generate points along each edge with organic wave offsets
 * 4. Connect points using Catmull-Rom to Bezier curve conversion for smooth lines
 * 5. Output as a single continuous closed path
 */

// Base unit for viewBox calculations - we scale from this
const BASE_VIEWBOX_SIZE = 400;

// Each edge gets a unique seed for consistent but varied wave patterns
const EDGE_SEEDS = {
  top: 1.23,
  right: 4.56,
  bottom: 7.89,
  left: 2.34,
};

/**
 * Calculate an organic wave offset for a point along an edge.
 *
 * Uses overlapping sine waves with different frequencies to create
 * natural-looking variation rather than uniform waves.
 *
 * @param {number} index - Position along the edge
 * @param {number} baseAmplitude - Maximum wave height
 * @param {number} seed - Unique seed for this edge
 * @returns {number} The offset distance from the edge
 */
function getOrganicOffset(index, baseAmplitude, seed) {
  const variation =
    Math.sin(index * 1.7 + seed) * 0.3 + Math.sin(index * 2.3 + seed * 1.5) * 0.2 + Math.sin(index * 0.9 + seed * 0.7) * 0.25;

  return baseAmplitude * (0.5 + variation);
}

/**
 * Generate points along a single edge with wave offsets applied.
 *
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {number} endX - Ending X coordinate
 * @param {number} endY - Ending Y coordinate
 * @param {number} segments - Number of segments to divide the edge into
 * @param {number} amplitude - Wave amplitude (how far waves extend)
 * @param {number} seed - Seed for organic variation
 * @param {Object} perpDirection - Unit vector perpendicular to the edge {x, y}
 * @returns {Array<{x: number, y: number}>} Array of points along the edge
 */
function generateEdgePoints(startX, startY, endX, endY, segments, amplitude, seed, perpDirection) {
  const points = [];
  const dx = (endX - startX) / segments;
  const dy = (endY - startY) / segments;

  for (let i = 0; i <= segments; i++) {
    const baseX = startX + dx * i;
    const baseY = startY + dy * i;

    // Keep corner points fixed, only wave the points in between
    if (i === 0 || i === segments) {
      points.push({ x: baseX, y: baseY });
    } else {
      const offset = getOrganicOffset(i, amplitude, seed);
      const direction = i % 2 === 0 ? 1 : -1; // Alternate wave direction

      points.push({
        x: baseX + perpDirection.x * offset * direction,
        y: baseY + perpDirection.y * offset * direction,
      });
    }
  }

  return points;
}

/**
 * Convert an array of points into a smooth SVG path using Catmull-Rom splines.
 *
 * Catmull-Rom splines pass through all control points and create smooth curves.
 * We convert them to cubic Bezier curves which SVG understands.
 *
 * @param {Array<{x: number, y: number}>} points - Points to connect
 * @returns {string} SVG path data string
 */
function generateSmoothPath(points) {
  if (points.length < 2) return "";

  const tension = 0.5; // Controls curve tightness (0 = sharp, 1 = loose)
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    // Get four points for Catmull-Rom calculation
    // Clamp to array bounds for start and end segments
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Convert Catmull-Rom to Bezier control points
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Calculate viewBox dimensions that match the target aspect ratio.
 *
 * @param {number} targetWidth - Actual display width in pixels
 * @param {number} targetHeight - Actual display height in pixels
 * @returns {{width: number, height: number}} ViewBox dimensions
 */
function calculateViewBox(targetWidth, targetHeight) {
  const aspectRatio = targetWidth / targetHeight;

  if (aspectRatio >= 1) {
    // Wider than tall
    return {
      width: BASE_VIEWBOX_SIZE * aspectRatio,
      height: BASE_VIEWBOX_SIZE,
    };
  } else {
    // Taller than wide
    return {
      width: BASE_VIEWBOX_SIZE,
      height: BASE_VIEWBOX_SIZE / aspectRatio,
    };
  }
}

/**
 * Calculate uniform segment counts based on edge lengths.
 * This ensures consistent wave density regardless of aspect ratio.
 *
 * @param {number} horizontalLength - Length of horizontal edges
 * @param {number} verticalLength - Length of vertical edges
 * @param {number} waveSegmentSize - Target size for each wave segment
 * @returns {{horizontal: number, vertical: number}} Segment counts
 */
function calculateSegments(horizontalLength, verticalLength, waveSegmentSize) {
  // Calculate segments proportionally to edge length
  const horizontalSegments = Math.max(4, Math.round(horizontalLength / waveSegmentSize));
  const verticalSegments = Math.max(4, Math.round(verticalLength / waveSegmentSize));

  return {
    horizontal: horizontalSegments,
    vertical: verticalSegments,
  };
}

/**
 * Generate the complete wiggly border path data.
 *
 * @param {Object} options
 * @param {number} [options.waveAmplitude=4] - How far waves extend from the edge
 * @param {number} [options.waveSegmentSize=25] - Distance between wave points
 * @param {number} [options.borderWidth=4] - Stroke width (affects inset)
 * @param {number} [options.targetWidth=400] - Actual display width in pixels
 * @param {number} [options.targetHeight=300] - Actual display height in pixels
 * @returns {{pathData: string, viewBoxWidth: number, viewBoxHeight: number}} Path data and viewBox dimensions
 */
function generateWigglyPath(options = {}) {
  const { waveAmplitude = 4, waveSegmentSize = 25, borderWidth = 4, targetWidth = 400, targetHeight = 300 } = options;

  // Calculate viewBox dimensions to match aspect ratio
  const viewBox = calculateViewBox(targetWidth, targetHeight);
  const viewBoxWidth = viewBox.width;
  const viewBoxHeight = viewBox.height;

  // Inset the path so waves don't get clipped at viewBox edges
  const padding = waveAmplitude + borderWidth;

  // Define the rectangle bounds (inset from viewBox edges)
  const left = padding;
  const right = viewBoxWidth - padding;
  const top = padding;
  const bottom = viewBoxHeight - padding;

  // Calculate actual edge lengths in viewBox units
  const horizontalLength = right - left;
  const verticalLength = bottom - top;

  // Calculate segment counts based on edge lengths for uniform density
  const segments = calculateSegments(horizontalLength, verticalLength, waveSegmentSize);

  // Generate points for each edge, going clockwise from top-left
  // The perpDirection vector points outward from the box

  const topPoints = generateEdgePoints(
    left,
    top,
    right,
    top,
    segments.horizontal,
    waveAmplitude,
    EDGE_SEEDS.top,
    { x: 0, y: -1 }, // Waves go up
  );

  const rightPoints = generateEdgePoints(
    right,
    top,
    right,
    bottom,
    segments.vertical,
    waveAmplitude,
    EDGE_SEEDS.right,
    { x: 1, y: 0 }, // Waves go right
  );

  const bottomPoints = generateEdgePoints(
    right,
    bottom,
    left,
    bottom,
    segments.horizontal,
    waveAmplitude,
    EDGE_SEEDS.bottom,
    { x: 0, y: 1 }, // Waves go down
  );

  const leftPoints = generateEdgePoints(
    left,
    bottom,
    left,
    top,
    segments.vertical,
    waveAmplitude,
    EDGE_SEEDS.left,
    { x: -1, y: 0 }, // Waves go left
  );

  // Combine all edge points into one continuous path
  // Skip duplicate corner points where edges meet
  const allPoints = [...topPoints, ...rightPoints.slice(1), ...bottomPoints.slice(1), ...leftPoints.slice(1, -1)];

  // Generate smooth path and close it
  const pathData = `${generateSmoothPath(allPoints)} Z`;

  return {
    pathData,
    viewBoxWidth,
    viewBoxHeight,
  };
}

/**
 * Generate a complete standalone SVG string.
 *
 * @param {Object} options
 * @param {string} [options.backgroundColor="#FFF8EA"]
 * @param {string} [options.borderColor="#815A0E"]
 * @param {number} [options.borderWidth=4]
 * @param {number} [options.waveAmplitude=4]
 * @param {number} [options.waveSegmentSize=25]
 * @param {number} [options.targetWidth=400]
 * @param {number} [options.targetHeight=300]
 * @returns {string} Complete SVG markup
 */
function generateSvgString(options = {}) {
  const {
    backgroundColor = "#FFF8EA",
    borderColor = "#815A0E",
    borderWidth = 4,
    waveAmplitude = 4,
    waveSegmentSize = 25,
    targetWidth = 400,
    targetHeight = 300,
  } = options;

  const { pathData, viewBoxWidth, viewBoxHeight } = generateWigglyPath({
    waveAmplitude,
    waveSegmentSize,
    borderWidth,
    targetWidth,
    targetHeight,
  });

  return `<svg
  viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
  preserveAspectRatio="none"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="${pathData}" fill="${backgroundColor}" />
  <path
    d="${pathData}"
    stroke="${borderColor}"
    stroke-width="${borderWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
    vector-effect="non-scaling-stroke"
  />
</svg>`;
}

/**
 * Generate a React component with the path baked in.
 *
 * @param {Object} options
 * @param {string} [options.backgroundColor="#FFF8EA"]
 * @param {string} [options.borderColor="#815A0E"]
 * @param {number} [options.borderWidth=4]
 * @param {number} [options.waveAmplitude=4]
 * @param {number} [options.waveSegmentSize=25]
 * @param {number} [options.targetWidth=400]
 * @param {number} [options.targetHeight=300]
 * @returns {string} React component code
 */
function generateReactComponent(options = {}) {
  const {
    backgroundColor = "#FFF8EA",
    borderColor = "#815A0E",
    borderWidth = 4,
    waveAmplitude = 4,
    waveSegmentSize = 25,
    targetWidth = 400,
    targetHeight = 300,
  } = options;

  const { pathData, viewBoxWidth, viewBoxHeight } = generateWigglyPath({
    waveAmplitude,
    waveSegmentSize,
    borderWidth,
    targetWidth,
    targetHeight,
  });

  return `import type { ReactNode } from "react";

type BoxWithWigglyBorderProps = {
  children: ReactNode;
  className?: string;
};

const PATH_DATA = "${pathData}";

export const BoxWithWigglyBorder = ({
  children,
  className = "",
}: BoxWithWigglyBorderProps) => {
  return (
    <div className={\`relative \${className}\`}>
      <svg
        className="absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={PATH_DATA} fill="${backgroundColor}" />
        <path
          d={PATH_DATA}
          stroke="${borderColor}"
          strokeWidth={${borderWidth}}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative px-[20px] py-[32px] text-center">
        {children}
      </div>
    </div>
  );
};

export default BoxWithWigglyBorder;`;
}

// Export functions for use by app.js
window.WigglyBorder = {
  generateWigglyPath,
  generateSvgString,
  generateReactComponent,
  calculateViewBox,
};

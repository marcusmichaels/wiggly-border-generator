# Wiggly Border Generator

A simple tool for creating organic, hand-drawn style SVG borders that scale with their container.

## How It Works

The generator creates a single continuous SVG path that forms a wiggly rectangle:

1. **Point Generation** — Points are placed along each edge of a rectangle with wave offsets applied perpendicular to the edge. The offsets use overlapping sine waves with different frequencies to create natural-looking irregularity rather than uniform waves.

2. **Smooth Curves** — Points are connected using Catmull-Rom splines, which pass through all control points and create smooth curves. These are converted to cubic Bezier curves that SVG understands.

3. **Scalable Output** — The SVG uses a fixed `viewBox` (400×300) with `preserveAspectRatio="none"` so it stretches to fill any container. The border stroke stays consistent at any size using `vector-effect="non-scaling-stroke"`.

## Files

```
wiggly-border-experiment/
├── index.html          # Page structure and controls
├── styles.css          # Minimal black and white styling
├── wiggly-border.js    # Path generation logic (no dependencies)
├── app.js              # UI controller
└── README.md
```

## Usage

Open `index.html` in a browser. No build step or server required.

### Controls

| Control           | Description                                         |
| ----------------- | --------------------------------------------------- |
| Background Color  | Fill color inside the border                        |
| Border Color      | Stroke color of the wiggly line                     |
| Text Color        | Color of the text content                           |
| Border Width      | Thickness of the stroke (1–8px)                     |
| Wave Amplitude    | How far waves extend from the edge                  |
| Wave Segment Size | Distance between wave points (smaller = more waves) |
| Box Width/Height  | Preview container size                              |

### Export

Click **Export** to reveal export options:

- **SVG** — Standalone SVG markup
- **React** — A React/TypeScript component with the path baked in

## Using the Output

### Standalone SVG

Drop the SVG into your HTML and style the container:

```html
<div style="position: relative; width: 300px; height: 200px;">
  <!-- paste SVG here -->
  <div style="position: relative; padding: 32px 20px; text-align: center;">Your content here</div>
</div>
```

### React Component

Import and use like any component:

```tsx
import { BoxWithWigglyBorder } from "./BoxWithWigglyBorder";

<BoxWithWigglyBorder>
  <h2>Title</h2>
  <p>Content goes here</p>
</BoxWithWigglyBorder>;
```

## Browser Support

Works in all modern browsers. The only feature with limited support is `vector-effect="non-scaling-stroke"` which is not supported in IE11 (no longer relevant for most projects).

## Customising the Algorithm

Edit the constants in `wiggly-border.js`:

```js
const VIEW_BOX_WIDTH = 400; // viewBox width
const VIEW_BOX_HEIGHT = 300; // viewBox height

const EDGE_SEEDS = {
  // Change for different wave patterns
  top: 1.23,
  right: 4.56,
  bottom: 7.89,
  left: 2.34,
};
```

The `getOrganicOffset` function controls wave variation. Adjust the multipliers and weights to change how organic the waves feel:

```js
const variation = Math.sin(index * 1.7 + seed) * 0.3 + Math.sin(index * 2.3 + seed * 1.5) * 0.2 + Math.sin(index * 0.9 + seed * 0.7) * 0.25;
```

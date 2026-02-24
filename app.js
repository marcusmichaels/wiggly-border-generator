/**
 * Wiggly Border Generator - UI Controller
 *
 * Handles user interactions and updates the preview in real-time.
 * Works with wiggly-border.js which contains the path generation logic.
 */

(function () {
  // ---------------------------------------------------------
  // DOM Element References
  // ---------------------------------------------------------

  const elements = {
    // Preview
    previewBox: document.getElementById("preview-box"),
    previewContent: document.querySelector(".preview-content"),
    fillPath: document.getElementById("fill-path"),
    strokePath: document.getElementById("stroke-path"),

    // Color inputs (picker + text field pairs)
    backgroundColor: document.getElementById("backgroundColor"),
    backgroundColorText: document.getElementById("backgroundColorText"),
    borderColor: document.getElementById("borderColor"),
    borderColorText: document.getElementById("borderColorText"),
    textColor: document.getElementById("textColor"),
    textColorText: document.getElementById("textColorText"),

    // Range sliders
    borderWidth: document.getElementById("borderWidth"),
    borderWidthValue: document.getElementById("borderWidthValue"),
    waveAmplitude: document.getElementById("waveAmplitude"),
    waveAmplitudeValue: document.getElementById("waveAmplitudeValue"),
    waveSegmentSize: document.getElementById("waveSegmentSize"),
    waveSegmentSizeValue: document.getElementById("waveSegmentSizeValue"),
    boxWidth: document.getElementById("boxWidth"),
    boxWidthValue: document.getElementById("boxWidthValue"),
    boxHeight: document.getElementById("boxHeight"),
    boxHeightValue: document.getElementById("boxHeightValue"),

    // Export
    exportSvg: document.getElementById("exportSvg"),
    exportReact: document.getElementById("exportReact"),
    exportCode: document.getElementById("exportCode"),
    copyCode: document.getElementById("copyCode"),
  };

  // ---------------------------------------------------------
  // Application State
  // ---------------------------------------------------------

  const state = {
    backgroundColor: "#FFF8EA",
    borderColor: "#F4E3C1",
    textColor: "#4A3F1F",
    borderWidth: 4,
    waveAmplitude: 4,
    waveSegmentSize: 25,
    boxWidth: 400,
    boxHeight: 250,
  };

  // ---------------------------------------------------------
  // Preview Updates
  // ---------------------------------------------------------

  /**
   * Regenerate the SVG path and update the preview display.
   * Called whenever any control value changes.
   */
  function updatePreview() {
    const pathData = WigglyBorder.generateWigglyPath({
      waveAmplitude: state.waveAmplitude,
      waveSegmentSize: state.waveSegmentSize,
      borderWidth: state.borderWidth,
    });

    // Update the fill (background) path
    elements.fillPath.setAttribute("d", pathData);
    elements.fillPath.setAttribute("fill", state.backgroundColor);

    // Update the stroke (border) path
    elements.strokePath.setAttribute("d", pathData);
    elements.strokePath.setAttribute("stroke", state.borderColor);
    elements.strokePath.setAttribute("stroke-width", state.borderWidth);
    elements.strokePath.setAttribute("stroke-linecap", "round");
    elements.strokePath.setAttribute("stroke-linejoin", "round");
    elements.strokePath.setAttribute("fill", "none");

    // Update preview box dimensions
    elements.previewBox.style.width = `${state.boxWidth}px`;
    elements.previewBox.style.height = `${state.boxHeight}px`;

    // Update text color
    elements.previewContent.style.color = state.textColor;
  }

  // ---------------------------------------------------------
  // Input Handlers
  // ---------------------------------------------------------

  /**
   * Set up a color picker and its paired text input to stay in sync.
   * Both update the state and trigger a preview update.
   */
  function syncColorInputs(colorPicker, textInput, stateKey) {
    // Color picker changed
    colorPicker.addEventListener("input", (e) => {
      const value = e.target.value;
      textInput.value = value.toUpperCase();
      state[stateKey] = value;
      updatePreview();
    });

    // Text input changed
    textInput.addEventListener("input", (e) => {
      let value = e.target.value;

      // Add # prefix if missing
      if (value && !value.startsWith("#")) {
        value = "#" + value;
      }

      // Only update if it's a valid 6-digit hex color
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        colorPicker.value = value;
        state[stateKey] = value;
        updatePreview();
      }
    });

    // Reset to current value if user leaves an invalid value
    textInput.addEventListener("blur", (e) => {
      e.target.value = state[stateKey].toUpperCase();
    });
  }

  /**
   * Set up a range slider to update state and display its current value.
   */
  function setupRangeInput(rangeInput, valueDisplay, stateKey) {
    rangeInput.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      state[stateKey] = value;
      valueDisplay.textContent = value;
      updatePreview();
    });
  }

  // ---------------------------------------------------------
  // Export Functions
  // ---------------------------------------------------------

  /**
   * Generate and display the standalone SVG code.
   */
  function exportSvg() {
    const svg = WigglyBorder.generateSvgString({
      backgroundColor: state.backgroundColor,
      borderColor: state.borderColor,
      borderWidth: state.borderWidth,
      waveAmplitude: state.waveAmplitude,
      waveSegmentSize: state.waveSegmentSize,
    });

    elements.exportCode.textContent = svg;
    elements.copyCode.style.display = "inline-block";
  }

  /**
   * Generate and display the React component code.
   */
  function exportReact() {
    const component = WigglyBorder.generateReactComponent({
      backgroundColor: state.backgroundColor,
      borderColor: state.borderColor,
      borderWidth: state.borderWidth,
      waveAmplitude: state.waveAmplitude,
      waveSegmentSize: state.waveSegmentSize,
    });

    elements.exportCode.textContent = component;
    elements.copyCode.style.display = "inline-block";
  }

  /**
   * Copy the current export code to the clipboard.
   */
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(elements.exportCode.textContent);

      // Show feedback
      const originalText = elements.copyCode.textContent;
      elements.copyCode.textContent = "Copied!";
      setTimeout(() => {
        elements.copyCode.textContent = originalText;
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  // ---------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------

  function init() {
    // Set up color inputs
    syncColorInputs(elements.backgroundColor, elements.backgroundColorText, "backgroundColor");
    syncColorInputs(elements.borderColor, elements.borderColorText, "borderColor");
    syncColorInputs(elements.textColor, elements.textColorText, "textColor");

    // Set up range sliders
    setupRangeInput(elements.borderWidth, elements.borderWidthValue, "borderWidth");
    setupRangeInput(elements.waveAmplitude, elements.waveAmplitudeValue, "waveAmplitude");
    setupRangeInput(elements.waveSegmentSize, elements.waveSegmentSizeValue, "waveSegmentSize");
    setupRangeInput(elements.boxWidth, elements.boxWidthValue, "boxWidth");
    setupRangeInput(elements.boxHeight, elements.boxHeightValue, "boxHeight");

    // Set up export buttons
    elements.exportSvg.addEventListener("click", exportSvg);
    elements.exportReact.addEventListener("click", exportReact);
    elements.copyCode.addEventListener("click", copyToClipboard);

    // Initial render
    updatePreview();
    exportSvg(); // Pre-populate export panel
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ============================================
   Poster - Poster Rendering and Styling
   ============================================ */

function updatePoster() {
    const frame = document.getElementById('posterFrame');
    const inner = document.getElementById('posterInner');
    const posterText = document.querySelector('.poster-text');
    const title = document.getElementById('posterTitle');
    const subtitle = document.getElementById('posterSubtitle');
    const coords = document.getElementById('posterCoords');
    const dateEl = document.getElementById('posterDate');
    const line1 = document.getElementById('posterLine1');
    const line2 = document.getElementById('posterLine2');

    // Background
    frame.style.background = state.bgColor;

    // Text position (only if not using panel themes)
    posterText.style.left = `${state.textX}%`;
    if (state.textTheme !== 'panel' && state.textTheme !== 'double' && state.textTheme !== 'gradient') {
        posterText.style.top = `${state.textY}%`;
    }

    // Text colors - only apply if no text theme is active (themes set their own colors)
    if (state.textTheme === 'none') {
        title.style.color = state.textColor;
        subtitle.style.color = state.textColor;
        coords.style.color = state.textColor;
        dateEl.style.color = state.textColor;
        line1.style.backgroundColor = state.textColor;
        line2.style.backgroundColor = state.textColor;
    }

    // Frame color via CSS variable
    frame.style.setProperty('--frame-color', state.textColor);

    // Corner decorations color
    document.querySelectorAll('.corner-decor').forEach(el => {
        el.style.borderColor = state.textColor;
    });

    updateMapWrapper();
}

function selectStyle(paletteId) {
    // Find palette in flattened list
    const palette = ALL_PALETTES.find(p => p.id === paletteId);
    if (!palette) return;

    state.style = palette;
    state.bgColor = palette.colors.background;
    state.textColor = palette.colors.text;

    // Update map tiles respecting labels setting
    updateMapTiles();

    // Apply vintage effect if vintage category
    const mapWrapper = document.getElementById('mapWrapper');
    if (palette.styleId === 'vintage') {
        mapWrapper.classList.add('vintage-map');
    } else {
        mapWrapper.classList.remove('vintage-map');
    }

    // Update theme colors to match new style
    updateThemeColors();

    // Update text color picker to match style
    const textPicker = document.getElementById('textColorPicker');
    const textHex = document.getElementById('textColorHex');
    if (textPicker) textPicker.value = state.textColor;
    if (textHex) textHex.value = state.textColor.toUpperCase();

    updatePoster();
    renderStyleGrid();
}

function selectFont(fontId) {
    state.font = FONTS.find(f => f.id === fontId);
    const fontFamily = state.font.family;
    document.getElementById('posterTitle').style.fontFamily = fontFamily;
    document.getElementById('posterSubtitle').style.fontFamily = fontFamily;
    document.getElementById('posterCoords').style.fontFamily = fontFamily;
    const dateEl = document.getElementById('posterDate');
    if (dateEl) dateEl.style.fontFamily = fontFamily;
    renderFontGrid();
}

function setAspect(aspect) {
    state.aspect = aspect;
    const frame = document.getElementById('posterFrame');

    frame.classList.remove('portrait', 'landscape', 'square');
    if (aspect !== 'portrait') frame.classList.add(aspect);

    document.querySelectorAll('.perspective-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.aspect === aspect);
    });

    updateMapWrapper();
    setTimeout(() => map.resize(), 300);
}

function setFrame(frameStyle) {
    state.frameStyle = frameStyle;
    const frame = document.getElementById('posterFrame');

    // Remove all frame classes
    frame.classList.remove('frame-none', 'frame-thin', 'frame-thick', 'frame-double', 'frame-vintage', 'frame-ornate');

    // Add new frame class
    if (frameStyle !== 'none') {
        frame.classList.add(`frame-${frameStyle}`);
    }

    // Update button states
    document.querySelectorAll('.frame-btn[data-frame]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.frame === frameStyle);
    });

    // Update frame colors via CSS variables
    frame.style.setProperty('--frame-color', state.frameColor);
    frame.style.setProperty('--frame-bg', state.bgColor);

    setTimeout(() => map.resize(), 100);
}

function setTextTheme(theme) {
    state.textTheme = theme;
    const overlay = document.querySelector('.poster-overlay');

    // Remove all theme classes
    overlay.classList.remove('theme-none', 'theme-gradient', 'theme-box', 'theme-panel', 'theme-double');

    // Add new theme class
    if (theme !== 'none') {
        overlay.classList.add(`theme-${theme}`);
    }

    // Update theme colors to match current map style
    updateThemeColors();

    // Update button states
    document.querySelectorAll('.frame-btn[data-theme]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Show/hide size slider (not applicable for none or box)
    const sizeContainer = document.getElementById('themeSizeContainer');
    const posYContainer = document.getElementById('textYContainer');

    if (theme === 'gradient' || theme === 'panel' || theme === 'double') {
        sizeContainer.style.display = 'block';
        if (posYContainer) posYContainer.style.display = 'none'; // Hide Y position when theme controls it
    } else {
        sizeContainer.style.display = 'none';
        if (posYContainer) posYContainer.style.display = 'block';
    }

    // Adjust text position for themes that need it
    const posterText = document.querySelector('.poster-text');
    if (theme === 'panel' || theme === 'double') {
        // Center text vertically in the panel area
        posterText.style.top = '88%';
    } else if (theme === 'gradient') {
        posterText.style.top = '85%';
    } else {
        posterText.style.top = `${state.textY}%`;
    }
}

function updateThemeColors() {
    const overlay = document.querySelector('.poster-overlay');
    if (!overlay) return;

    // Use current background color for theme (from selected palette)
    // Use current state.textColor for text (which may have been customized by user)
    const themeColor = state.bgColor || state.style.colors?.background || '#ffffff';
    const themeBorderColor = state.textColor || state.style.colors?.text || '#2C2C2C';
    const themeTextColor = state.textColor || state.style.colors?.text || '#2C2C2C';

    overlay.style.setProperty('--theme-color', themeColor);
    overlay.style.setProperty('--theme-border-color', themeBorderColor);
    overlay.style.setProperty('--theme-text-color', themeTextColor);
    overlay.style.setProperty('--theme-size', `${state.themeSize}%`);

    // Apply text colors directly when theme is active (to override inline styles)
    if (state.textTheme !== 'none') {
        const title = document.getElementById('posterTitle');
        const subtitle = document.getElementById('posterSubtitle');
        const coords = document.getElementById('posterCoords');
        const dateEl = document.getElementById('posterDate');
        const line1 = document.getElementById('posterLine1');
        const line2 = document.getElementById('posterLine2');

        if (title) title.style.color = themeTextColor;
        if (subtitle) subtitle.style.color = themeTextColor;
        if (coords) coords.style.color = themeTextColor;
        if (dateEl) dateEl.style.color = themeTextColor;
        if (line1) line1.style.backgroundColor = themeTextColor;
        if (line2) line2.style.backgroundColor = themeTextColor;
    }
}

function updateThemeSize(size) {
    state.themeSize = size;
    const overlay = document.querySelector('.poster-overlay');
    overlay.style.setProperty('--theme-size', `${size}%`);
    document.getElementById('themeSizeValue').textContent = `${size}%`;

    // Force repaint to apply CSS variable to pseudo-elements
    overlay.classList.remove(`theme-${state.textTheme}`);
    void overlay.offsetWidth; // Force reflow
    if (state.textTheme !== 'none') {
        overlay.classList.add(`theme-${state.textTheme}`);
    }
}

function updateFrameColor(color) {
    state.frameColor = color;
    const frame = document.getElementById('posterFrame');
    frame.style.setProperty('--frame-color', color);

    // Update both picker and hex input
    document.getElementById('frameColorPicker').value = color;
    document.getElementById('frameColorHex').value = color.toUpperCase();
}

function updateTextColor(color) {
    state.textColor = color;

    // Update poster text elements
    const posterText = document.querySelector('.poster-text');
    if (posterText) {
        posterText.style.color = color;
    }

    // Update individual elements
    const title = document.getElementById('posterTitle');
    const subtitle = document.getElementById('posterSubtitle');
    const coords = document.getElementById('posterCoords');

    if (title) title.style.color = color;
    if (subtitle) subtitle.style.color = color;
    if (coords) coords.style.color = color;

    // Update lines color
    const subtitleLines = document.querySelector('.subtitle-lines');
    if (subtitleLines) {
        subtitleLines.style.setProperty('--line-color', color);
    }

    // Update both picker and hex input
    document.getElementById('textColorPicker').value = color;
    document.getElementById('textColorHex').value = color.toUpperCase();
}

function toggleOption(option) {
    const toggle = document.getElementById(`toggle${option.charAt(0).toUpperCase() + option.slice(1)}`);

    if (option === 'coords') {
        state.showCoords = !state.showCoords;
        document.getElementById('posterCoords').style.display = state.showCoords ? 'block' : 'none';
    } else if (option === 'lines') {
        state.showLines = !state.showLines;
        document.getElementById('subtitleWrapper').style.display = state.showLines ? 'flex' : 'none';
    } else if (option === 'labels') {
        state.showLabels = !state.showLabels;
        updateMapTiles();
    } else if (option === 'date') {
        state.showDate = !state.showDate;
        document.getElementById('posterDate').style.display = state.showDate ? 'block' : 'none';
        document.getElementById('dateInputWrapper').style.display = state.showDate ? 'block' : 'none';
    }

    toggle.classList.toggle('active');
}

function updateDate() {
    const dateInput = document.getElementById('dateInput');
    if (dateInput.value) {
        const date = new Date(dateInput.value);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('nb-NO', options);
        state.dateValue = formattedDate;
        document.getElementById('posterDate').textContent = formattedDate;
    }
}

function updateTextX(value) {
    state.textX = parseInt(value);
    document.getElementById('textXValue').textContent = `${value}%`;
    const posterText = document.querySelector('.poster-text');
    posterText.style.left = `${value}%`;
}

function updateTextY(value) {
    state.textY = parseInt(value);
    document.getElementById('textYValue').textContent = `${value}%`;
    const posterText = document.querySelector('.poster-text');
    // Only update Y position if not using fixed-position themes
    if (state.textTheme !== 'panel' && state.textTheme !== 'double' && state.textTheme !== 'gradient') {
        posterText.style.top = `${value}%`;
    }
}

/* ============================================
   Main - Application Entry Point
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderStyleGrid();
    renderFontGrid();
    setupEventListeners();
    initializeSliders();
    setupKeyboardShortcuts();
    updatePoster();
    updateMapFilters();
    updateThemeColors();
    loadApiKey();

    // Initialize new features
    updateLetterSpacing();
});

/* ============================================
   Stickers - Sticker Management Functions
   ============================================ */

function selectSticker(emoji) {
    // Toggle sticker selection
    if (state.selectedSticker === emoji) {
        state.selectedSticker = null;
        document.querySelectorAll('.sticker-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.poster-inner').classList.remove('sticker-placing');
    } else {
        state.selectedSticker = emoji;
        document.querySelectorAll('.sticker-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sticker === emoji);
        });
        document.querySelector('.poster-inner').classList.add('sticker-placing');
        showNotification('Klikk pa kartet for a plassere stickeren', 'info');
    }
}

function placeSticker(x, y) {
    if (!state.selectedSticker) return;

    const sticker = {
        id: Date.now(),
        emoji: state.selectedSticker,
        x: x, // Percentage from left
        y: y, // Percentage from top
        size: state.stickerSize
    };

    state.stickers.push(sticker);
    renderStickers();

    // Deselect after placing
    state.selectedSticker = null;
    document.querySelectorAll('.sticker-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.poster-inner').classList.remove('sticker-placing');
}

function renderStickers() {
    // Remove existing stickers
    document.querySelectorAll('.placed-sticker').forEach(el => el.remove());

    const posterInner = document.querySelector('.poster-inner');

    state.stickers.forEach(sticker => {
        const el = document.createElement('div');
        el.className = 'placed-sticker';
        el.textContent = sticker.emoji;
        el.style.left = `${sticker.x}%`;
        el.style.top = `${sticker.y}%`;
        el.style.fontSize = `${sticker.size}px`;
        el.style.transform = 'translate(-50%, -50%)';
        el.dataset.stickerId = sticker.id;

        // Double-click to remove
        el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            removeSticker(sticker.id);
        });

        // Drag to move
        el.addEventListener('mousedown', (e) => {
            if (e.detail === 2) return; // Ignore double-clicks
            e.stopPropagation();
            startDragSticker(e, sticker);
        });

        posterInner.appendChild(el);
    });
}

function removeSticker(id) {
    state.stickers = state.stickers.filter(s => s.id !== id);
    renderStickers();
}

function clearStickers() {
    state.stickers = [];
    renderStickers();
    showNotification('Alle stickers fjernet', 'success');
}

function startDragSticker(e, sticker) {
    const posterInner = document.querySelector('.poster-inner');
    const rect = posterInner.getBoundingClientRect();

    const onMove = (moveEvent) => {
        const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

        sticker.x = Math.max(5, Math.min(95, x));
        sticker.y = Math.max(5, Math.min(95, y));

        const el = document.querySelector(`[data-sticker-id="${sticker.id}"]`);
        if (el) {
            el.style.left = `${sticker.x}%`;
            el.style.top = `${sticker.y}%`;
        }
    };

    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

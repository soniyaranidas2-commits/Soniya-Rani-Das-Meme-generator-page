/**
 * SELECT ELEMENTS
 */
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const topTextInput = document.getElementById('topTextInput');
const bottomTextInput = document.getElementById('bottomTextInput');
const fontSizeInput = document.getElementById('fontSizeInput');
const colorInput = document.getElementById('colorInput');
const fontFamilyInput = document.getElementById('fontFamilyInput'); // New Font Selector
const downloadBtn = document.getElementById('downloadBtn');
const placeholderText = document.getElementById('placeholderText');

/**
 * STATE VARIABLES
 */
let image;
let currentFilter = 'none';
let topTextPos = { x: 0, y: 50 };
let bottomTextPos = { x: 0, y: 0 };
let isDragging = false;
let selectedText = null;

/**
 * 1. IMAGE UPLOAD LOGIC
 */
imageInput.addEventListener('change', (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                image = img;
                // Default positions: Top and Bottom center
                topTextPos = { x: image.width / 2, y: 60 };
                bottomTextPos = { x: image.width / 2, y: image.height - 60 };
                
                placeholderText.style.display = 'none';
                updateMemeCanvas();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

/**
 * 2. FILTER LOGIC
 */
function applyFilter(filterStr) {
    currentFilter = filterStr;
    updateMemeCanvas();
}

/**
 * 3. CORE RENDERING ENGINE
 */
function updateMemeCanvas() {
    if (!image) return;

    // Match canvas size to image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw Image with Filters
    ctx.filter = currentFilter;
    ctx.drawImage(image, 0, 0);
    ctx.filter = 'none'; // Reset filter so text stays crisp

    // Text Styling
    const fontSize = fontSizeInput.value;
    const selectedFont = fontFamilyInput.value; // Get font from dropdown
    
    ctx.fillStyle = colorInput.value;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 8;
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px "${selectedFont}", sans-serif`;

    // Draw Top Text
    ctx.textBaseline = 'middle';
    drawText(topTextInput.value.toUpperCase(), topTextPos.x, topTextPos.y);

    // Draw Bottom Text
    drawText(bottomTextInput.value.toUpperCase(), bottomTextPos.x, bottomTextPos.y);
}

function drawText(text, x, y) {
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);
}

/**
 * 4. INTERACTIVE DRAGGING LOGIC
 */
canvas.addEventListener('mousedown', (e) => {
    if (!image) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Check if mouse is near Top Text or Bottom Text
    if (Math.abs(mouseY - topTextPos.y) < 60) {
        selectedText = 'top';
        isDragging = true;
    } else if (Math.abs(mouseY - bottomTextPos.y) < 60) {
        selectedText = 'bottom';
        isDragging = true;
    }
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (selectedText === 'top') {
        topTextPos = { x: mouseX, y: mouseY };
    } else {
        bottomTextPos = { x: mouseX, y: mouseY };
    }
    updateMemeCanvas();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    selectedText = null;
});

/**
 * 5. EVENT LISTENERS & DOWNLOAD
 */
// Listen for any input changes to redraw instantly
[topTextInput, bottomTextInput, fontSizeInput, colorInput, fontFamilyInput].forEach(el => {
    el.addEventListener('input', updateMemeCanvas);
});

downloadBtn.addEventListener('click', () => {
    if (!image) return alert("Upload an image first!");
    
    const link = document.createElement('a');
    link.download = 'custom-meme.png';
    link.href = canvas.toDataURL();
    link.click();
});
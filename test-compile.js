const fs = require('fs');
const babel = require('@babel/core');

const code = fs.readFileSync('client/src/components/modals/BookingModals.jsx', 'utf8');

try {
  babel.transformSync(code, {
    presets: ['@babel/preset-react', ['@babel/preset-env', { targets: { node: 'current' } }]]
  });
  console.log("BookingModals Compiled SUCCESSFULLY!");
} catch (e) {
  console.error("BookingModals FAILED:", e.message);
}

const sliderCode = fs.readFileSync('client/src/components/BookingProfileSlider.jsx', 'utf8');
try {
  babel.transformSync(sliderCode, {
    presets: ['@babel/preset-react', ['@babel/preset-env', { targets: { node: 'current' } }]]
  });
  console.log("Slider Compiled SUCCESSFULLY!");
} catch (e) {
  console.error("Slider FAILED:", e.message);
}

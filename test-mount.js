require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react']
});
const React = require('react');
const { renderToString } = require('react-dom/server');
const { AddBookingModal } = require('./client/src/components/modals/BookingModals.jsx');
const BookingProfileSlider = require('./client/src/components/BookingProfileSlider.jsx').default;

console.log("Rendering AddBookingModal...");
try {
  renderToString(React.createElement(AddBookingModal, { show: true, onClose: () => {}, onSave: () => {}, customers: [], departures: [] }));
  console.log("AddBookingModal OK");
} catch (e) {
  console.error("AddBookingModal CRASH:", e);
}

console.log("Rendering BookingProfileSlider (Empty)...");
try {
  renderToString(React.createElement(BookingProfileSlider, { bookingId: 1, onClose: () => {} }));
  console.log("BookingProfileSlider OK");
} catch (e) {
  console.error("BookingProfileSlider CRASH:", e);
}

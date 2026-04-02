import React from 'react';
import { renderToString } from 'react-dom/server';
import { AddBookingModal } from './client/src/components/modals/BookingModals.jsx';

const html = renderToString(
  <AddBookingModal show={true} onClose={() => {}} onSave={() => {}} customers={[]} departures={[]} />
);
console.log(html ? "Success" : "Failed");

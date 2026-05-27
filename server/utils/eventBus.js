const EventEmitter = require('events');

class GlobalEventBus extends EventEmitter {}

const eventBus = new GlobalEventBus();

/**
 * Abstraction layer over EventEmitter for emitting system events.
 * This allows swapping the underlying transport (e.g. to Redis/RabbitMQ) later.
 * 
 * @param {string} eventCode - The code of the event from SystemEvents.js
 * @param {Object} payload - The data payload associated with the event
 */
function emitEvent(eventCode, payload) {
  console.log(`[EventBus] Emitting event: ${eventCode}`);
  eventBus.emit(eventCode, payload);
}

/**
 * Register a listener for a specific system event.
 * 
 * @param {string} eventCode - The code of the event from SystemEvents.js
 * @param {Function} handler - The callback function(payload)
 */
function onEvent(eventCode, handler) {
  eventBus.on(eventCode, handler);
}

module.exports = {
  emitEvent,
  onEvent
};

const { emitEvent } = require('./server/utils/eventBus');
const SystemEvents = require('./server/constants/SystemEvents');

emitEvent(SystemEvents.LEAVE_REQUEST_CREATED, {
  employee_name: "Minh",
  leave_type: "Annual Leave",
  from_date: "2026-05-28",
  days: 2
});

console.log("Event emitted. Exiting test script.");

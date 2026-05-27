const CHANNELS = {
  EMAIL: 'EMAIL',
  IN_APP: 'IN_APP',
  DIGEST: 'DIGEST',
  SMS: 'SMS',
  PUSH: 'PUSH',
};

const PRIORITY = {
  HIGH: 'HIGH',
  NORMAL: 'NORMAL',
  LOW: 'LOW',
};

const POLICIES = {
  'leave.created': {
    channels: [CHANNELS.EMAIL, CHANNELS.IN_APP],
    priority: PRIORITY.HIGH,
    digestable: false,
    template_slug: 'leave_created_alert'
  },
  'leave.approved': {
    channels: [CHANNELS.EMAIL, CHANNELS.IN_APP],
    priority: PRIORITY.HIGH,
    digestable: false,
    template_slug: 'leave_approved_alert'
  },
  'leave.rejected': {
    channels: [CHANNELS.EMAIL, CHANNELS.IN_APP],
    priority: PRIORITY.HIGH,
    digestable: false,
    template_slug: 'leave_rejected_alert'
  },
  'lead.created': {
    channels: [CHANNELS.IN_APP, CHANNELS.EMAIL],
    priority: PRIORITY.NORMAL,
    digestable: true,
    template_slug: 'lead_created_alert'
  },
  'lead.updated': {
    channels: [CHANNELS.IN_APP],
    priority: PRIORITY.LOW,
    digestable: true,
  },
  'booking.confirmed': {
    channels: [CHANNELS.EMAIL, CHANNELS.IN_APP],
    priority: PRIORITY.HIGH,
    digestable: false,
    template_slug: 'booking_confirm'
  },
};

module.exports = {
  CHANNELS,
  PRIORITY,
  POLICIES
};

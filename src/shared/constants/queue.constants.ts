export const QUEUES = {
  EMAIL: 'email',
  CLOUDINARY_CLEANUP: 'cloudinary-cleanup',
} as const;

export const EMAIL_JOBS = {
  SEND_OFFLINE_NOTIFICATION: 'send-offline-notification',
} as const;

export const CLOUDINARY_JOBS = {
  DELETE_FILE: 'delete-file',
} as const;
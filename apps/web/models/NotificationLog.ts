import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationLog {
  userId: mongoose.Types.ObjectId;
  channelId?: mongoose.Types.ObjectId;
  channelType: string;
  channelName?: string;
  source: string;
  eventType: string;
  status: "success" | "failure" | "skipped";
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawError?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface NotificationLogDocument extends INotificationLog, Document {}

const NotificationLogSchema = new Schema<NotificationLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channelId: { type: Schema.Types.ObjectId },
    channelType: { type: String, required: true },
    channelName: { type: String },
    source: { type: String, required: true },
    eventType: { type: String, required: true },
    status: {
      type: String,
      enum: ["success", "failure", "skipped"],
      required: true,
    },
    error: { type: String },
    rawError: { type: Schema.Types.Mixed },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt needed
    expireAfterSeconds: 60 * 60 * 24 * 7, // Auto-delete after 7 days to save space
  },
);

// Index for getting logs by user
NotificationLogSchema.index({ userId: 1, createdAt: -1 });

const NotificationLog: Model<NotificationLogDocument> =
  mongoose.models.NotificationLog ||
  mongoose.model<NotificationLogDocument>(
    "NotificationLog",
    NotificationLogSchema,
  );

export default NotificationLog;

const mongoose = require('mongoose');

const jobTrackerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  applications: [{
    applicationId: String,
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    jobUrl: String,
    appliedDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn'],
      default: 'applied',
      index: true
    },
    statusHistory: [{
      status: String,
      changedAt: Date,
      notes: String
    }],
    interviewRounds: [{
      roundNumber: Number,
      type: String,
      scheduledDate: Date,
      completedDate: Date,
      feedback: String,
      result: { type: String, enum: ['pass', 'fail', 'pending'] }
    }],
    salary: {
      min: Number,
      max: Number,
      currency: String
    },
    location: String,
    notes: String,
    rating: { type: Number, min: 1, max: 5 },
    lastUpdated: Date
  }],
  totalApplications: { type: Number, default: 0 },
  totalOffers: { type: Number, default: 0 },
  conversionRate: Number,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

jobTrackerSchema.index({ userId: 1, 'applications.status': 1 });
jobTrackerSchema.index({ userId: 1, 'applications.appliedDate': -1 });

module.exports = mongoose.model('JobTracker', jobTrackerSchema);
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    // Expo push token (e.g., ExponentPushToken[xxx])
    pushToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Platform (ios/android)
    platform: {
        type: String,
        enum: ['ios', 'android', 'web'],
        default: 'android'
    },

    // Device is active (can receive pushes)
    isActive: {
        type: Boolean,
        default: true
    },

    // Last time device was seen
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update lastSeen on each registration
deviceSchema.pre('findOneAndUpdate', function () {
    this.set({ lastSeen: new Date() });
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;

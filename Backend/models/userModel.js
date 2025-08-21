import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Please provide a username'],
   
    trim: true,
    maxlength: [20, 'Username cannot be more than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
  
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user',
},
  avatar: {
    type: String,
    default: 'default_avatar_url'
  },
  bio: {
    type: String,
    maxlength: [150, 'Bio cannot be more than 150 characters'],
    default: ''
  },

  // Language Information
  nativeLanguage: {
    type: String,
    required: [true, 'Please select your native language'],
    enum: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Hindi', 'Arabic']
  },
  learningLanguage: {
      type: String,
      required: true
    },

  knownLanguage: {
    type: String,
    required: true
},

isAvailable: {
    type: Boolean,
    default: true // used for matching availability
},
// User Preferences
  topicsOfInterest: [{
    type: String,
    enum: ['Travel', 'Food', 'Sports', 'Movies', 'Technology', 'Business', 'Culture', 'Daily Life']
  }],
  availability: {
    type: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      timeSlots: [String] // e.g. ["morning", "afternoon", "evening"]
    }],
    default: []
  },
  callDurationPreference: {
    type: Number,
    enum: [10, 15, 20, 30, 45, 60],
    default: 15
  },

  // User Stats
  totalCalls: {
    type: Number,
    default: 0
  },
  totalMinutes: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must be at most 5']
  },
  ratingCount: {
    type: Number,
    default: 0
  },

  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  callStatus: {
    type: String,
    enum: ['available', 'in_call', 'busy'],
    default: 'available'
  },
  lastActive: {
    type: Date
  },
  socketId: {
    type: String,
    default: ''
  },

  // Social Connections
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]},
{
  timestamps: true 
}
);


const User = mongoose.model('User', userSchema);
export default User;

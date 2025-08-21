import redisClient from '../config/redis.js';
import User from '../Models/userModel.js';
import { validate } from "../utils/validator.js";
//import { validate } from '../utils/validator.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ========================== REGISTER ==========================
const register = async (req, res) => {
  
  try {
    validate(req.body);

    const { username, email, password,nativeLanguage,
      learningLanguage, // Note: Must match schema (plural)
      knownLanguage } = req.body;
      
    console.log("REQ.BODY right after validate:", req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 5. Create minimal user document first
    const userData = {
      username,
      email,
      password: hashedPassword,
      nativeLanguage,
      learningLanguage, // Must match schema
      knownLanguage,
      role: 'user'
    };
  
    console.log("Final user data before saving:", req.body);

    const user = new User(userData);
await user.save({ bufferTimeoutMS: 30000 });


    const token = jwt.sign(
      { _id: user._id, email, role: 'user' },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true, sameSite: 'Lax' });

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      message: 'Registered successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// ========================== LOGIN ==========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new Error('Invalid credentials');

    const user = await User.findOne({ email }).select('+password');

    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true, sameSite: 'Lax' });

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: error.message });
  }
};

// ========================== LOGOUT ==========================
const logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).send('No token found in cookies');
    }

    const payload = jwt.decode(token);

    await redisClient.set(`blacklist:${token}`, 'true');
    await redisClient.expireAt(`blacklist:${token}`, payload.exp);

    res.clearCookie('token');

    res.status(200).send('Logout successfully');
  } catch (error) {
    console.error('Logout error:', error);
    res.status(503).send('Logout Error: ' + error.message);
  }
};

// ========================== ADMIN REGISTER ==========================
const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      ...req.body,
      password: hashedPassword,
      role: 'admin',
    });

    const token = jwt.sign(
      { _id: adminUser._id, email, role: 'admin' },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true, sameSite: 'Lax' });

    res.status(201).send('Admin registered successfully');
  } catch (error) {
    console.error(error);
    res.status(400).send('Error: ' + error.message);
  }
};

// ========================== DELETE PROFILE ==========================
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id; // user ID from the auth middleware

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ========================== GET USER PROFILE ==========================
const getUser = async (req, res) => {
  try {
    const userId = req.user._id; // user id from auth middleware

    const user = await User.findById(userId).select('-password'); // exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ========================== UPDATE USER PROFILE ==========================
const updateUser = async (req, res) => {
  try {
    const userId = req.user._id; // from middleware
    const updates = req.body; // new values from frontend

    // prevent role/password updates here unless explicitly allowed
    if (updates.password) delete updates.password;
    if (updates.role) delete updates.role;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export { register, login, logout, adminRegister, deleteProfile, getUser, updateUser};

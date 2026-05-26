import express from 'express'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js'
import User from '../models/User.js' // <--- IMPORTING THE REAL DATABASE!

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check REAL MongoDB for existing user
    const existingUser = await User.findOne({ email: email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const passwordHash = await hashPassword(password)
    
    // Save new user to REAL MongoDB
    const newUser = new User({
      name: name,
      email: email,
      passwordHash: passwordHash
    })
    await newUser.save() // This locks it into your cloud database permanently!

    const token = generateToken(newUser._id)

    res.json({
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      token,
    })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    // Search REAL MongoDB for the user
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed' })
  }
})
// TEMPORARY ROUTE to delete a stuck email!
router.get('/nuke/:email', async (req, res) => {
  try {
    const targetEmail = req.params.email;
    const result = await User.deleteOne({ email: targetEmail });
    
    if (result.deletedCount === 1) {
      res.send(`SUCCESS! ${targetEmail} has been permanently deleted from the database. You can now sign up!`);
    } else {
      res.send(`Hmm, we couldn't find ${targetEmail} in the database. Are you sure it's typed perfectly?`);
    }
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

export default router
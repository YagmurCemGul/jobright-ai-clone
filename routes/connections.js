const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   POST api/connections/send/:id
// @desc    Send a connection request
// @access  Private
router.post('/send/:id', auth, async (req, res) => {
  try {
    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(req.params.id);

    if (!recipient) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if users are already connected
    if (sender.connections.includes(recipient.id)) {
      return res.status(400).json({ msg: 'Users are already connected' });
    }

    // Check if a request has already been sent
    if (sender.sentConnections.includes(recipient.id)) {
      return res
        .status(400)
        .json({ msg: 'Connection request already sent' });
    }

    // Check if the user is trying to connect with themselves
    if (sender.id === recipient.id) {
      return res.status(400).json({ msg: 'You cannot connect with yourself' });
    }

    sender.sentConnections.push(recipient.id);
    recipient.pendingConnections.push(sender.id);

    // Create notification
    const newNotification = new Notification({
      user: recipient.id,
      sender: sender.id,
      type: 'new_request',
      message: `${sender.name} has sent you a connection request.`,
    });

    await newNotification.save();
    await sender.save();
    await recipient.save();

    res.json({ msg: 'Connection request sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections
// @desc    Get all connections
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('connections', [
      'name',
      'email',
    ]);
    res.json(user.connections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/connections/accept/:id
// @desc    Accept a connection request
// @access  Private
router.post('/accept/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sender = await User.findById(req.params.id);

    if (!sender) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if there is a pending request
    if (!user.pendingConnections.includes(sender.id)) {
      return res.status(400).json({ msg: 'No pending request from this user' });
    }

    // Add to connections
    user.connections.push(sender.id);
    sender.connections.push(user.id);

    // Remove from pending/sent lists
    user.pendingConnections = user.pendingConnections.filter(
      (id) => id.toString() !== sender.id.toString()
    );
    sender.sentConnections = sender.sentConnections.filter(
      (id) => id.toString() !== user.id.toString()
    );

    // Create notification for the user who sent the request
    const newNotification = new Notification({
      user: sender.id,
      sender: user.id,
      type: 'request_accepted',
      message: `${user.name} has accepted your connection request.`,
    });

    await newNotification.save();
    await user.save();
    await sender.save();

    res.json({ msg: 'Connection accepted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/connections/reject/:id
// @desc    Reject a connection request
// @access  Private
router.post('/reject/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sender = await User.findById(req.params.id);

    if (!sender) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if there is a pending request
    if (!user.pendingConnections.includes(sender.id)) {
      return res.status(400).json({ msg: 'No pending request from this user' });
    }

    // Remove from pending/sent lists
    user.pendingConnections = user.pendingConnections.filter(
      (id) => id.toString() !== sender.id.toString()
    );
    sender.sentConnections = sender.sentConnections.filter(
      (id) => id.toString() !== user.id.toString()
    );

    await user.save();
    await sender.save();

    res.json({ msg: 'Connection rejected' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/pending
// @desc    Get all pending connections
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'pendingConnections',
      ['name', 'email']
    );
    res.json(user.pendingConnections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/company/:companyName
// @desc    Get connections by company
// @access  Private
router.get('/company/:companyName', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('connections');
    const { companyName } = req.params;

    const companyConnections = user.connections.filter(
      (connection) =>
        connection.currentCompany.toLowerCase() === companyName.toLowerCase()
    );

    res.json(companyConnections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();



/**
 * @route   GET /api/settings
 * @desc    Get all settings
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const [settings] = await pool.query(`SELECT 
        bussinessName AS name,
        bussinessEmail AS email,
        bussinessPhone AS phone,
        bussinessAddress AS address,
        bussinessWebsite AS website,
        bussinessDescription AS description
      FROM settings`);
    
    // If no settings exist yet
    if (settings.length === 0) {
      return res.status(404).json({success:false, message: 'No settings found' });
    }
    
    // Return the first settings entry (typically there would be only one)
    return res.status(200).json({success:true, data: settings[0] });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bussinessName,
      bussinessEmail,
      bussinessPhone,
      bussinessAddress,
      bussinessWebsite,
      bussinessDescription
    } = req.body;

    // Validate required fields
    if (!bussinessName || !bussinessEmail || !bussinessPhone || 
        !bussinessAddress || !bussinessWebsite || !bussinessDescription) {
      return res.status(400).json({ success:false,message: 'All fields are required' });
    }

    // Check if settings with this ID exists
    const [existingSettings] = await pool.query('SELECT * FROM settings WHERE id = ?', [id]);
    
    if (existingSettings.length === 0) {
      return res.status(404).json({ success:false,message: 'Settings not found' });
    }

    // Update settings
    await pool.query(
      `UPDATE settings SET 
        bussinessName = ?, 
        bussinessEmail = ?, 
        bussinessPhone = ?, 
        bussinessAddress = ?, 
        bussinessWebsite = ?, 
        bussinessDescription = ? 
      WHERE id = ?`,
      [
        bussinessName,
        bussinessEmail,
        bussinessPhone,
        bussinessAddress,
        bussinessWebsite,
        bussinessDescription,
        id
      ]
    );

    // Get updated settings
    const [updatedSettings] = await pool.query('SELECT * FROM settings WHERE id = ?', [id]);
    
    return res.status(200).json({
        success:true,
      message: 'Settings updated successfully',
      settings: updatedSettings[0]
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
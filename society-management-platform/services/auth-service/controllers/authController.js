const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    const { username, password, role_name, admin_registration_key, name, phone, email, flat_id } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const roleName = typeof role_name === 'string' ? role_name.toUpperCase() : '';
    const residentName = typeof name === 'string' ? name.trim() : '';
    const residentPhone = typeof phone === 'string' ? phone.trim() : '';
    const residentEmail = typeof email === 'string' ? email.trim() : null;
    const residentFlatId = Number(flat_id);

    if (!normalizedUsername || typeof password !== 'string' || !['ADMIN', 'RESIDENT'].includes(roleName)) {
        return res.status(400).json({ message: 'Username, password, and a valid account type are required' });
    }
    if (normalizedUsername.length > 50 || password.length < 8) {
        return res.status(400).json({ message: 'Username must be 50 characters or fewer and password must be at least 8 characters' });
    }
    if (roleName === 'ADMIN' && (!process.env.ADMIN_REGISTRATION_KEY || admin_registration_key !== process.env.ADMIN_REGISTRATION_KEY)) {
        return res.status(403).json({ message: 'A valid admin registration key is required' });
    }
    if (roleName === 'RESIDENT' && (!residentName || residentName.length > 100 || !residentPhone || residentPhone.length > 20 ||
        (email != null && typeof email !== 'string') || (residentEmail && residentEmail.length > 100) ||
        !Number.isSafeInteger(residentFlatId) || residentFlatId < 1)) {
        return res.status(400).json({ message: 'Name, phone, and a valid flat are required for resident registration' });
    }
    if (roleName === 'RESIDENT' && !/^[6-9]\d{9}$/.test(residentPhone)) {
        return res.status(400).json({ message: 'Phone must be a valid 10-digit Indian mobile number' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [roles] = await connection.query('SELECT id FROM roles WHERE role_name = ?', [roleName]);
        if (roles.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'This account type is not configured' });
        }

        const [existingUsers] = await connection.query('SELECT id FROM users WHERE username = ?', [normalizedUsername]);
        if (existingUsers.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Username already exists' });
        }

        if (roleName === 'RESIDENT') {
            const [flats] = await connection.query('SELECT id FROM flats WHERE id = ? FOR UPDATE', [residentFlatId]);
            if (flats.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Selected flat does not exist' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)',
            [normalizedUsername, hashedPassword, roles[0].id]
        );

        if (roleName === 'RESIDENT') {
            await connection.query(
                'INSERT INTO residents (user_id, flat_id, name, phone, email, move_in_date) VALUES (?, ?, ?, ?, ?, CURDATE())',
                [userResult.insertId, residentFlatId, residentName, residentPhone, residentEmail || null]
            );
        }

        await connection.commit();
        return res.status(201).json({ message: 'User registered successfully', userId: userResult.insertId });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Registration rollback error:', rollbackError);
            }
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username or phone number is already registered' });
        }
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection?.release();
    }
};

const getAvailableFlats = async (req, res) => {
    try {
        const [flats] = await db.query(`
            SELECT f.id, f.flat_number, f.block
            FROM flats f
            ORDER BY f.block, f.flat_number
        `);
        return res.status(200).json(flats);
    } catch (error) {
        console.error('Available flats error:', error);
        return res.status(500).json({ message: 'Unable to load available flats' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const [users] = await db.query(`
            SELECT u.*, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.username, r.role_name, u.created_at
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = ?
        `, [req.user.userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profile = users[0];

        // If user is resident, fetch resident details
        if (profile.role_name === 'RESIDENT') {
            const [residents] = await db.query(`
                SELECT r.name, r.phone, r.email, r.move_in_date, f.flat_number, f.block
                FROM residents r
                JOIN flats f ON r.flat_id = f.id
                WHERE r.user_id = ?
            `, [profile.id]);
            
            if (residents.length > 0) {
                profile.resident_details = residents[0];
            }
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { register, getAvailableFlats, login, getProfile };

const db = require('../config/db');

// Financial Analytics
const getFinancialStats = async (req, res) => {
    try {
        const [paid] = await db.query("SELECT SUM(amount) as total FROM maintenance_bills WHERE status = 'PAID'");
        const [pending] = await db.query("SELECT SUM(amount) as total FROM maintenance_bills WHERE status IN ('UNPAID', 'OVERDUE')");
        const revenue = Number(paid[0].total) || 0;
        const pendingDues = Number(pending[0].total) || 0;
        const totalBilled = revenue + pendingDues;
        
        res.status(200).json({
            revenue,
            pending_dues: pendingDues,
            collection_rate: totalBilled === 0 ? '0.00' : ((revenue / totalBilled) * 100).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complaint Insights
const getComplaintInsights = async (req, res) => {
    try {
        const [statusCounts] = await db.query("SELECT status, COUNT(*) as count FROM complaints GROUP BY status");
        const [categoryCounts] = await db.query("SELECT category, COUNT(*) as count FROM complaints GROUP BY category");
        
        const data = {
            by_status: statusCounts.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {}),
            by_category: categoryCounts.map(row => ({ name: row.category, value: row.count }))
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Events
const getEvents = async (req, res) => {
    try {
        const [events] = await db.query("SELECT * FROM events ORDER BY event_date ASC");
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Service Providers
const getProviders = async (req, res) => {
    try {
        const [providers] = await db.query("SELECT * FROM service_providers ORDER BY rating DESC");
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Feedback
const getFeedback = async (req, res) => {
    try {
        const [feedback] = await db.query(`
            SELECT f.id, f.rating, f.comments,
                   DATE_FORMAT(f.created_at, '%Y-%m-%dT%H:%i:%s') AS created_at,
                   COALESCE(resident_by_id.name, resident_by_user.name, u.username, 'Former Resident') AS resident_name
            FROM feedback f
            LEFT JOIN residents resident_by_id ON resident_by_id.id = f.resident_id
            LEFT JOIN users u ON u.id = COALESCE(f.user_id, resident_by_id.user_id)
            LEFT JOIN residents resident_by_user ON resident_by_user.user_id = u.id
            ORDER BY f.created_at DESC
        `);
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const submitFeedback = async (req, res) => {
    const userId = Number(req.headers['x-user-id']);
    const rating = Number(req.body.rating);
    const comments = req.body.comments;

    if (!Number.isSafeInteger(userId) || userId < 1) {
        return res.status(401).json({ message: 'Sign in before submitting feedback' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (comments != null && typeof comments !== 'string') {
        return res.status(400).json({ message: 'Feedback comments must be text' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO feedback (user_id, rating, comments) VALUES (?, ?, ?)',
            [userId, rating, comments?.trim() || null]
        );
        const [rows] = await db.query(`
            SELECT f.id, f.rating, f.comments,
                   DATE_FORMAT(f.created_at, '%Y-%m-%dT%H:%i:%s') AS created_at,
                   COALESCE(r.name, u.username, 'Former Resident') AS resident_name
            FROM feedback f
            JOIN users u ON u.id = f.user_id
            LEFT JOIN residents r ON r.user_id = u.id
            WHERE f.id = ?
        `, [result.insertId]);
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Feedback submission error:', error);
        return res.status(500).json({ message: 'Could not save feedback' });
    }
};

module.exports = { getFinancialStats, getComplaintInsights, getEvents, getProviders, getFeedback, submitFeedback };

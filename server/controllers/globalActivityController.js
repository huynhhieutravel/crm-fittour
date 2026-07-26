const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const getGlobalActivities = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ga.*, u.full_name as user_name, u.avatar_url as user_avatar,
             p.content as parent_content, COALESCE(pu.full_name, '[BOT] FIT Tour Điều Phối Lead') as parent_user_name
      FROM global_activities ga
      LEFT JOIN users u ON ga.user_id = u.id
      LEFT JOIN global_activities p ON ga.parent_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      ORDER BY ga.created_at ASC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching global activities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createGlobalActivity = async (req, res) => {
  const { content, type, parent_id, metadata } = req.body;
  const user_id = req.user.id;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO global_activities (user_id, content, type, parent_id, reactions, metadata)
      VALUES ($1, $2, $3, $4, '{}'::jsonb, $5::jsonb)
      RETURNING *
    `, [user_id, content, type || 'CHAT', parent_id || null, JSON.stringify(metadata || {})]);
    
    const newActivity = rows[0];
    
    // Fetch the user's name to attach to the broadcast
    const userRes = await pool.query('SELECT full_name as user_name, avatar_url as user_avatar FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length > 0) {
      newActivity.user_name = userRes.rows[0].user_name;
      newActivity.user_avatar = userRes.rows[0].user_avatar;
    }

    if (newActivity.parent_id) {
      const parentRes = await pool.query(`
        SELECT ga.content as parent_content, u.full_name as parent_user_name
        FROM global_activities ga
        LEFT JOIN users u ON ga.user_id = u.id
        WHERE ga.id = $1
      `, [newActivity.parent_id]);
      if (parentRes.rows.length > 0) {
        newActivity.parent_content = parentRes.rows[0].parent_content;
        newActivity.parent_user_name = parentRes.rows[0].parent_user_name;
      }
    }

    // Broadcast to all connected clients
    global.io.emit('new_global_activity', newActivity);

    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating global activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const toggleReaction = async (req, res) => {
  const activityId = req.params.id;
  const { reaction } = req.body; // e.g., 'heart', 'like', 'haha'
  const userId = req.user.id;

  if (!reaction) {
    return res.status(400).json({ error: 'Reaction type is required' });
  }

  try {
    // Get current reactions
    const actRes = await pool.query('SELECT reactions FROM global_activities WHERE id = $1', [activityId]);
    if (actRes.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    let reactions = actRes.rows[0].reactions || {};
    
    console.log('--- toggleReaction ---');
    console.log('activityId:', activityId);
    console.log('reaction:', reaction);
    console.log('userId:', userId);
    console.log('reactions BEFORE:', JSON.stringify(reactions));
    
    // Ensure the reaction type array exists
    if (!reactions[reaction]) {
      reactions[reaction] = [];
    }

    // Toggle logic: if user already reacted this type, remove them. If not, add them.
    const userIndex = reactions[reaction].indexOf(userId);
    if (userIndex > -1) {
      reactions[reaction].splice(userIndex, 1);
      // Remove empty reaction keys
      if (reactions[reaction].length === 0) {
        delete reactions[reaction];
      }
    } else {
      reactions[reaction].push(userId);
    }
    console.log('reactions AFTER:', JSON.stringify(reactions));

    // Save back to DB
    const updateRes = await pool.query(`
      UPDATE global_activities 
      SET reactions = $1 
      WHERE id = $2 
      RETURNING *
    `, [reactions, activityId]);

    const updatedActivity = updateRes.rows[0];

    // Broadcast to all connected clients
    global.io.emit('reaction_updated', {
      activity_id: activityId,
      reactions: updatedActivity.reactions
    });

    res.json({ success: true, reactions: updatedActivity.reactions });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getGlobalActivities,
  createGlobalActivity,
  toggleReaction
};

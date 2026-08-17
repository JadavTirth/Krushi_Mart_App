import { supabase } from '../lib/supabase';

/**
 * Broadcasts a notification to all registered users.
 * 
 * @param {string} adminId - The ID of the admin user broadcasting the message
 * @param {string} title - The notification title
 * @param {string} body - The notification body message
 * @param {number} priority - Priority level (1 for high, 0 for normal)
 * @returns {Promise<boolean>}
 */
export const broadcastNotification = async (adminId, title, body, priority = 0) => {
  try {
    // 1. Fetch all registered user IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;
    if (!users || users.length === 0) return true;

    // 2. Prepare notifications list for bulk insert
    const notificationInserts = users.map(user => ({
      user_id: user.id,
      type: 'alert',
      title: title,
      message: `📢 ${title}: ${body}`,
      read: false,
      priority: priority,
      related_user_id: adminId || null,
    }));

    // 3. Insert notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notificationInserts);

    if (insertError) throw insertError;
    return true;
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    throw error;
  }
};

/**
 * Fetches unique broadcast notification history.
 * Groups by message content to return deduplicated broadcast alerts.
 * 
 * @returns {Promise<Array>} List of broadcasts
 */
export const fetchBroadcastHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('message, priority, created_at')
      .eq('type', 'alert')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Deduplicate broadcasts by message text in JavaScript
    const uniqueBroadcasts = [];
    const seenMessages = new Set();

    for (const item of (data || [])) {
      if (!seenMessages.has(item.message)) {
        seenMessages.add(item.message);
        uniqueBroadcasts.push(item);
      }
    }

    return uniqueBroadcasts;
  } catch (error) {
    console.error('Error fetching broadcast history:', error);
    throw error;
  }
};

/**
 * Deletes a broadcast notification from all users' notification lists.
 * 
 * @param {string} message - The full formatted message to match and delete
 * @returns {Promise<boolean>}
 */
export const deleteBroadcast = async (message) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('message', message)
      .eq('type', 'alert');

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting broadcast notification:', error);
    throw error;
  }
};

/**
 * Fetches all notifications for a specific user.
 * 
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} List of user notifications
 */
export const fetchUserNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

/**
 * Marks a notification as read.
 * 
 * @param {string} notificationId - The ID of the notification
 * @returns {Promise<boolean>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Formats a date string (ISO timestamp) into a human-readable relative time string.
 * 
 * @param {string|Date} dateInput - The date input
 * @returns {string} The relative time representation (e.g. "just now", "10m ago", "2h ago", "1d ago")
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    const now = new Date();
    const date = new Date(dateInput);
    const diffMs = now.getTime() - date.getTime();
    
    // Handle future dates or minor clock mismatches
    if (diffMs < 0) {
      return 'just now';
    }
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      // Return formatted date like "May 22, 2026"
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

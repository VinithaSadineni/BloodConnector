import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, parseISO, format } from "date-fns"

/**
 * ClassName merger utility combining clsx and tailwind-merge.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formats standard date strings to a user-friendly fuzzy relative time (e.g. "3 mins ago").
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (err) {
    return 'just now';
  }
}

/**
 * Formats a date into a clean absolute format (e.g. "25 May 2026, 04:30 PM").
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, "dd MMM yyyy, hh:mm a");
  } catch (err) {
    return 'Invalid Date';
  }
}

/**
 * Blood group color styles mapping (bg, text, and border classes).
 */
export function bloodGroupColor(group) {
  const mapping = {
    'A+': {
      bg: 'bg-red-500/10 hover:bg-red-500/20',
      text: 'text-red-500',
      border: 'border-red-500/30',
      hex: '#C8102E'
    },
    'A-': {
      bg: 'bg-rose-500/10 hover:bg-rose-500/20',
      text: 'text-rose-500',
      border: 'border-rose-500/30',
      hex: '#FF5252'
    },
    'B+': {
      bg: 'bg-orange-500/10 hover:bg-orange-500/20',
      text: 'text-orange-500',
      border: 'border-orange-500/30',
      hex: '#FFB020'
    },
    'B-': {
      bg: 'bg-amber-500/10 hover:bg-amber-500/20',
      text: 'text-amber-500',
      border: 'border-amber-500/30',
      hex: '#FFD700'
    },
    'AB+': {
      bg: 'bg-purple-500/10 hover:bg-purple-500/20',
      text: 'text-purple-500',
      border: 'border-purple-500/30',
      hex: '#9c27b0'
    },
    'AB-': {
      bg: 'bg-violet-500/10 hover:bg-violet-500/20',
      text: 'text-violet-500',
      border: 'border-violet-500/30',
      hex: '#7c4dff'
    },
    'O+': {
      bg: 'bg-blue-500/10 hover:bg-blue-500/20',
      text: 'text-blue-500',
      border: 'border-blue-500/30',
      hex: '#0095FF'
    },
    'O-': {
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
      text: 'text-cyan-500',
      border: 'border-cyan-500/30',
      hex: '#00D68F'
    }
  };
  
  return mapping[group] || {
    bg: 'bg-slate-500/10 hover:bg-slate-500/20',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    hex: '#8899AA'
  };
}

/**
 * Urgency level styles mapping.
 */
export function urgencyColor(level) {
  const mapping = {
    critical: {
      bg: 'bg-red-500/15',
      text: 'text-red-500',
      border: 'border-red-500/40',
      icon: '🚨',
      label: 'Critical / SOS'
    },
    urgent: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-500',
      border: 'border-orange-500/40',
      icon: '⚠️',
      label: 'Urgent'
    },
    moderate: {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-500',
      border: 'border-yellow-500/40',
      icon: '⏰',
      label: 'Moderate'
    },
    normal: {
      bg: 'bg-green-500/15',
      text: 'text-green-500',
      border: 'border-green-500/40',
      icon: '✓',
      label: 'Normal'
    }
  };
  return mapping[level] || {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/40',
    icon: '',
    label: level
  };
}

/**
 * Request status color styles mapping.
 */
export function statusColor(status) {
  const mapping = {
    pending: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400 border-yellow-400/20',
      dot: 'bg-yellow-400'
    },
    accepted: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400 border-blue-400/20',
      dot: 'bg-blue-400'
    },
    processing: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400 border-orange-400/20',
      dot: 'bg-orange-400'
    },
    completed: {
      bg: 'bg-green-500/10',
      text: 'text-green-400 border-green-400/20',
      dot: 'bg-green-400'
    },
    rejected: {
      bg: 'bg-red-500/10',
      text: 'text-red-400 border-red-400/20',
      dot: 'bg-red-400'
    },
    cancelled: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400 border-slate-500/20',
      dot: 'bg-slate-400'
    }
  };
  return mapping[status] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400'
  };
}

/**
 * Maps major Indian cities to longitude/latitude coordinates.
 * Mapped for MongoDB 2dsphere [lng, lat] requirement.
 */
export function getCityCoordinates(cityName) {
  const cleanCity = (cityName || '').trim().toLowerCase();
  const database = {
    'bangalore': [77.5946, 12.9716],
    'bengaluru': [77.5946, 12.9716],
    'mumbai': [72.8777, 19.0760],
    'bombay': [72.8777, 19.0760],
    'delhi': [77.2090, 28.6139],
    'new delhi': [77.2090, 28.6139],
    'chennai': [80.2707, 13.0827],
    'madras': [80.2707, 13.0827],
    'hyderabad': [78.4867, 17.3850],
    'kolkata': [88.3639, 22.5726],
    'calcutta': [88.3639, 22.5726],
    'pune': [73.8567, 18.5204],
    'ahmedabad': [72.5714, 23.0225],
    'jaipur': [75.7873, 26.9124],
    'lucknow': [80.9462, 26.8467]
  };

  // If found in database, return coordinate array
  if (database[cleanCity]) {
    return database[cleanCity];
  }

  // Fallback: Generate semi-random coordinate in the vicinity of Bangalore
  // so the application doesn't break geospatial search checks
  const randomOffsetLng = (Math.random() - 0.5) * 0.1;
  const randomOffsetLat = (Math.random() - 0.5) * 0.1;
  return [77.5946 + randomOffsetLng, 12.9716 + randomOffsetLat];
}

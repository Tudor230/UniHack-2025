export function formatTime(dateString: string | null): string {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  }
  
  export function formatDateHeader(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC', // Ensure consistent date interpretation
      });
    } catch (error) {
      console.error('Error formatting date header:', error);
      return dateString;
    }
  }
  
  /**
   * Helper to format the "Day X" part
   * @param startDate The ISO date string of the trip start
   * @param currentDate The ISO date string of the day to check
   * @returns The day number (e.g., 1, 2, 3)
   */
  export function getDayNumber(startDate: string, currentDate: string): number {
    const start = new Date(startDate);
    const current = new Date(currentDate);
    // Reset time part to 00:00:00 for accurate day diff
    start.setUTCHours(0, 0, 0, 0);
    current.setUTCHours(0, 0, 0, 0);
    
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Day 1
  }
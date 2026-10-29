export function formatIncidentDate(dateString: string, timeString?: string | null) {
  if (!dateString) return 'N/A';

  // Combine date and time to ensure accurate day-of-week calculation
  const dateObj = new Date(`${dateString}T${timeString || '00:00:00'}`);

  // 1. Format Day (e.g., "19")
  const day = String(dateObj.getDate()).padStart(2, '0');

  // 2. Format Time (e.g., "0900H")
  let timeFormatted = '0000H'; // Default if no time provided
  if (timeString) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      timeFormatted = `${parts[0]}${parts[1]}H`;
    }
  }

  // 3. Format Month and Year (e.g., "January 2026")
  const monthYear = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // 4. Format Day of the Week (e.g., "Monday")
  const dayOfWeek = dateObj.toLocaleString('en-US', { weekday: 'long' });

  // Combine them
  return `${day} ${timeFormatted} ${monthYear}, ${dayOfWeek}`;
}
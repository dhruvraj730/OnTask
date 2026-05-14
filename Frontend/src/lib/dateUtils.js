/**
 * Central date formatting utilities for OnTask.
 * All date displays across the project use DD/MM/YYYY format (en-GB locale).
 */

const DATE_LOCALE = 'en-GB'; // forces DD/MM/YYYY

/**
 * Format a date as DD/MM/YYYY  →  e.g. 03/05/2026
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(DATE_LOCALE);
};

/**
 * Format a date + time  →  e.g. 03/05/2026, 18:45
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(DATE_LOCALE, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

/**
 * Format time only  →  e.g. 06:29 PM
 */
export const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString(DATE_LOCALE, {
        hour: '2-digit', minute: '2-digit',
    });
};

/**
 * WhatsApp-style label: "Today", "Yesterday", or full date DD/MM/YYYY
 */
export const getDateLabel = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString(DATE_LOCALE, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
};

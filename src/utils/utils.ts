/**
 * Generate a unique session ID for chat sessions
 * Format: 'sess-' + random alphanumeric string
 */
export const generateSessionId = (): string => {
    return 'sess-' + Math.random().toString(36).substr(2, 9);
};

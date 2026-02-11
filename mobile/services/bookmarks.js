/**
 * Bookmark Storage Service
 * Manages saved/bookmarked jobs in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@safirajobs_bookmarks';

/**
 * Get all bookmarked job IDs
 */
export const getBookmarks = async () => {
    try {
        const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        return [];
    }
};

/**
 * Check if a job is bookmarked
 */
export const isBookmarked = async (jobId) => {
    const bookmarks = await getBookmarks();
    return bookmarks.includes(jobId);
};

/**
 * Toggle bookmark for a job
 * Returns the new bookmark state (true if added, false if removed)
 */
export const toggleBookmark = async (jobId) => {
    try {
        const bookmarks = await getBookmarks();
        const index = bookmarks.indexOf(jobId);

        let newBookmarks;
        let isNowBookmarked;

        if (index > -1) {
            // Remove bookmark
            newBookmarks = bookmarks.filter(id => id !== jobId);
            isNowBookmarked = false;
        } else {
            // Add bookmark
            newBookmarks = [...bookmarks, jobId];
            isNowBookmarked = true;
        }

        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
        return isNowBookmarked;
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return false;
    }
};

/**
 * Add a job to bookmarks
 */
export const addBookmark = async (jobId) => {
    try {
        const bookmarks = await getBookmarks();
        if (!bookmarks.includes(jobId)) {
            bookmarks.push(jobId);
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        }
        return true;
    } catch (error) {
        console.error('Error adding bookmark:', error);
        return false;
    }
};

/**
 * Remove a job from bookmarks
 */
export const removeBookmark = async (jobId) => {
    try {
        const bookmarks = await getBookmarks();
        const newBookmarks = bookmarks.filter(id => id !== jobId);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
        return true;
    } catch (error) {
        console.error('Error removing bookmark:', error);
        return false;
    }
};

/**
 * Clear all bookmarks
 */
export const clearBookmarks = async () => {
    try {
        await AsyncStorage.removeItem(BOOKMARKS_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing bookmarks:', error);
        return false;
    }
};

export default {
    getBookmarks,
    isBookmarked,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    clearBookmarks,
};

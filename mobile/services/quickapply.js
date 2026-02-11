/**
 * QuickApply Service
 * Manages swipe history, applied jobs, and rejected jobs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const APPLIED_JOBS_KEY = '@safirajobs_applied';
const REJECTED_JOBS_KEY = '@safirajobs_rejected';
const SWIPE_HISTORY_KEY = '@safirajobs_swipe_history';

/**
 * Get all applied job IDs
 */
export const getAppliedJobs = async () => {
    try {
        const data = await AsyncStorage.getItem(APPLIED_JOBS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting applied jobs:', error);
        return [];
    }
};

/**
 * Get all rejected job IDs
 */
export const getRejectedJobs = async () => {
    try {
        const data = await AsyncStorage.getItem(REJECTED_JOBS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting rejected jobs:', error);
        return [];
    }
};

/**
 * Get full swipe history with timestamps
 */
export const getSwipeHistory = async () => {
    try {
        const data = await AsyncStorage.getItem(SWIPE_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting swipe history:', error);
        return [];
    }
};

/**
 * Apply to a job (swipe right)
 * Stores locally and syncs to backend
 */
export const applyToJob = async (jobId, jobDetails = {}) => {
    try {
        // Add to applied jobs
        const applied = await getAppliedJobs();
        if (!applied.includes(jobId)) {
            applied.push(jobId);
            await AsyncStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(applied));
        }

        // Add to swipe history
        const history = await getSwipeHistory();
        history.push({
            jobId,
            action: 'applied',
            timestamp: new Date().toISOString(),
            jobTitle: jobDetails.title,
            organization: jobDetails.organization,
        });
        await AsyncStorage.setItem(SWIPE_HISTORY_KEY, JSON.stringify(history));

        // TODO: Sync to backend
        // await syncApplyToBackend(jobId);

        return true;
    } catch (error) {
        console.error('Error applying to job:', error);
        return false;
    }
};

/**
 * Reject a job (swipe left)
 * Stores locally only - no backend sync needed
 */
export const rejectJob = async (jobId) => {
    try {
        const rejected = await getRejectedJobs();
        if (!rejected.includes(jobId)) {
            rejected.push(jobId);
            await AsyncStorage.setItem(REJECTED_JOBS_KEY, JSON.stringify(rejected));
        }

        // Add to swipe history
        const history = await getSwipeHistory();
        history.push({
            jobId,
            action: 'rejected',
            timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem(SWIPE_HISTORY_KEY, JSON.stringify(history));

        return true;
    } catch (error) {
        console.error('Error rejecting job:', error);
        return false;
    }
};

/**
 * Get all swiped job IDs (both applied and rejected)
 */
export const getSwipedJobIds = async () => {
    const applied = await getAppliedJobs();
    const rejected = await getRejectedJobs();
    return [...applied, ...rejected];
};

/**
 * Filter out already swiped jobs from a list
 */
export const filterUnswipedJobs = async (jobs) => {
    const swipedIds = await getSwipedJobIds();
    return jobs.filter(job => !swipedIds.includes(job._id));
};

/**
 * Get count of applied jobs
 */
export const getAppliedCount = async () => {
    const applied = await getAppliedJobs();
    return applied.length;
};

/**
 * Clear all swipe history (for testing/reset)
 */
export const clearSwipeHistory = async () => {
    try {
        await AsyncStorage.multiRemove([
            APPLIED_JOBS_KEY,
            REJECTED_JOBS_KEY,
            SWIPE_HISTORY_KEY,
        ]);
        return true;
    } catch (error) {
        console.error('Error clearing swipe history:', error);
        return false;
    }
};

/**
 * Undo last swipe action
 */
export const undoLastSwipe = async () => {
    try {
        const history = await getSwipeHistory();
        if (history.length === 0) return null;

        const lastAction = history.pop();
        await AsyncStorage.setItem(SWIPE_HISTORY_KEY, JSON.stringify(history));

        // Remove from appropriate list
        if (lastAction.action === 'applied') {
            const applied = await getAppliedJobs();
            const updated = applied.filter(id => id !== lastAction.jobId);
            await AsyncStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(updated));
        } else {
            const rejected = await getRejectedJobs();
            const updated = rejected.filter(id => id !== lastAction.jobId);
            await AsyncStorage.setItem(REJECTED_JOBS_KEY, JSON.stringify(updated));
        }

        return lastAction.jobId;
    } catch (error) {
        console.error('Error undoing swipe:', error);
        return null;
    }
};

export default {
    getAppliedJobs,
    getRejectedJobs,
    getSwipeHistory,
    applyToJob,
    rejectJob,
    getSwipedJobIds,
    filterUnswipedJobs,
    getAppliedCount,
    clearSwipeHistory,
    undoLastSwipe,
};

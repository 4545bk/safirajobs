/**
 * CV Context
 * Provides shared state for all CV Builder screens
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadCV, saveCV, getEmptyCV, calculateCompletion } from '../services/cvStorage';

// Create the context
const CVContext = createContext(null);

// Action types
const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    LOAD_CV: 'LOAD_CV',
    UPDATE_SECTION: 'UPDATE_SECTION',
    SET_STEP: 'SET_STEP',
    SAVE_SUCCESS: 'SAVE_SUCCESS',
    RESET_CV: 'RESET_CV',
    SET_TEMPLATE: 'SET_TEMPLATE',
};

// Initial state
const initialState = {
    cvData: getEmptyCV(),
    currentStep: 0,
    isLoading: true,
    isSaving: false,
    hasUnsavedChanges: false,
    lastSavedAt: null,
    error: null,
    selectedTemplate: 'classic-teal', // Default template
};

/**
 * Reducer for CV state management
 */
function cvReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case ACTIONS.LOAD_CV:
            return {
                ...state,
                cvData: action.payload || getEmptyCV(),
                isLoading: false,
                currentStep: action.payload?.currentStep || 0,
            };

        case ACTIONS.UPDATE_SECTION:
            const updatedCVData = {
                ...state.cvData,
                [action.section]: action.data,
                updatedAt: new Date().toISOString(),
            };
            return {
                ...state,
                cvData: {
                    ...updatedCVData,
                    completionPercent: calculateCompletion(updatedCVData),
                },
                hasUnsavedChanges: true,
            };

        case ACTIONS.SET_STEP:
            return {
                ...state,
                currentStep: action.step,
                cvData: {
                    ...state.cvData,
                    currentStep: action.step,
                },
            };

        case ACTIONS.SAVE_SUCCESS:
            return {
                ...state,
                isSaving: false,
                hasUnsavedChanges: false,
                lastSavedAt: new Date(),
            };

        case ACTIONS.RESET_CV:
            return {
                ...initialState,
                cvData: getEmptyCV(),
                isLoading: false,
            };

        case ACTIONS.SET_TEMPLATE:
            return {
                ...state,
                selectedTemplate: action.templateId,
                hasUnsavedChanges: true,
            };

        default:
            return state;
    }
}

/**
 * CV Provider Component
 * Wraps CV Builder screens to provide shared state
 */
export function CVProvider({ children }) {
    const [state, dispatch] = useReducer(cvReducer, initialState);

    // Load CV data on mount
    useEffect(() => {
        const loadData = async () => {
            const data = await loadCV();
            dispatch({ type: ACTIONS.LOAD_CV, payload: data });
        };
        loadData();
    }, []);

    // Auto-save when data changes
    useEffect(() => {
        if (state.hasUnsavedChanges && !state.isLoading) {
            const save = async () => {
                await saveCV(state.cvData);
                dispatch({ type: ACTIONS.SAVE_SUCCESS });
            };
            // Debounce save by 500ms
            const timer = setTimeout(save, 500);
            return () => clearTimeout(timer);
        }
    }, [state.cvData, state.hasUnsavedChanges, state.isLoading]);

    // Context value with state and actions
    const value = {
        // State
        cvData: state.cvData,
        currentStep: state.currentStep,
        isLoading: state.isLoading,
        isSaving: state.isSaving,
        completionPercent: state.cvData?.completionPercent || 0,
        selectedTemplate: state.selectedTemplate,

        // Actions
        updateSection: (section, data) => {
            dispatch({ type: ACTIONS.UPDATE_SECTION, section, data });
        },

        setStep: (step) => {
            dispatch({ type: ACTIONS.SET_STEP, step });
        },

        resetCV: () => {
            dispatch({ type: ACTIONS.RESET_CV });
        },

        setTemplate: (templateId) => {
            dispatch({ type: ACTIONS.SET_TEMPLATE, templateId });
        },

        // Save manually (for explicit save button)
        saveNow: async () => {
            await saveCV(state.cvData);
            dispatch({ type: ACTIONS.SAVE_SUCCESS });
        },
    };

    return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

/**
 * Custom hook to access CV context
 * @returns {Object} CV context value
 */
export function useCV() {
    const context = useContext(CVContext);
    if (!context) {
        throw new Error('useCV must be used within a CVProvider');
    }
    return context;
}

export default CVContext;

// js/dataManager.js

// import { publicHolidays } from './publicHolidays.js';
// import { optionalHolidays } from './optionalHolidays.js'; // NEW: Import optionalHolidays

const dataManager = (function() {
    // Key for storing data in localStorage
    const LOCAL_STORAGE_KEY = 'calendarDateStates';

    // Stores the state of each date. Key: 'YYYY-MM-DD', Value: 'normal', 'leave', 'working'
    let dateStates = {};

    /**
     * Initializes dateStates by attempting to load from localStorage.
     */
    function loadDateStates() {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                dateStates = JSON.parse(storedData);
            }
        } catch (e) {
            console.error("Error loading date states from localStorage:", e);
            dateStates = {}; // Fallback to empty if loading fails
        }
    }

    /**
     * Saves the current dateStates to localStorage.
     */
    function saveDateStates() {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dateStates));
        } catch (e) {
            console.error("Error saving date states to localStorage:", e);
        }
    }

    // Call loadDateStates immediately when the module is initialized
    loadDateStates();

    /**
     * Retrieves the state of a given date.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     * @returns {string} 'normal', 'leave', 'working', or undefined if not set.
     */
    function getDateState(dateString) {
        return dateStates[dateString] || 'normal'; // Default to 'normal' if not explicitly set
    }

    /**
     * Sets the state of a given date and saves to localStorage.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     * @param {string} state - 'normal', 'leave', or 'working'.
     */
    function setDateState(dateString, state) {
        dateStates[dateString] = state;
        saveDateStates(); // Save changes immediately
    }

    /**
     * Checks if a given date is a public holiday.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     * @returns {boolean} True if it's a public holiday, false otherwise.
     */
    function isPublicHoliday(dateString) {
        return publicHolidays[dateString] === true;
    }

    /**
     * NEW: Checks if a given date is an optional holiday.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     * @returns {boolean} True if it's an optional holiday, false otherwise.
     */
    function isOptionalHoliday(dateString) {
        return optionalHolidays[dateString] === true;
    }

    /**
     * Gets all stored date states.
     * @returns {object} An object containing all date states.
     */
    function getAllDateStates() {
        return { ...dateStates }; // Return a copy to prevent external modification
    }

    /**
     * Clears all date states for a specific month and saves to localStorage.
     * @param {number} year - The year (e.g., 2025).
     * @param {number} month - The month (0-indexed, e.g., 0 for January, 5 for June).
     */
    function clearMonthData(year, month) {
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        for (const dateString in dateStates) {
            if (dateString.startsWith(monthPrefix)) {
                delete dateStates[dateString];
            }
        }
        saveDateStates(); // Save changes immediately
    }

    return {
        getDateState,
        setDateState,
        isPublicHoliday,
        isOptionalHoliday, // NEW: Expose the new function
        getAllDateStates,
        clearMonthData
    };
})();
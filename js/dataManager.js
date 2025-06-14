// js/dataManager.js

const dataManager = (function() {
    // Stores the state of each date. Key: 'YYYY-MM-DD', Value: 'normal', 'leave', 'working'
    const dateStates = {};

    // Stores public holidays. Key: 'YYYY-MM-DD', Value: true
    const publicHolidays = {};

    // Example public holidays for June 2025 (adjust as needed for your region)
    // As of today, June 14, 2025, we'll assume a couple of holidays for demonstration.
    // Assuming a hypothetical holiday on June 16 (Monday) for Eid al-Adha,
    // and another on June 20 (Friday) for Rath Yatra based on typical Indian holidays.
    publicHolidays['2025-06-16'] = true; // Monday, June 16, 2025 (Eid al-Adha - tentative date)
    publicHolidays['2025-06-20'] = true; // Friday, June 20, 2025 (Rath Yatra - tentative date)


    /**
     * Retrieves the state of a given date.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     * @returns {string} 'normal', 'leave', 'working', or undefined if not set.
     */
    function getDateState(dateString) {
        return dateStates[dateString] || 'normal'; // Default to 'normal' if not explicitly set
    }

    /**
     * Sets the state of a given date.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     * @param {string} state - 'normal', 'leave', or 'working'.
     */
    function setDateState(dateString, state) {
        dateStates[dateString] = state;
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
     * Gets all stored date states.
     * @returns {object} An object containing all date states.
     */
    function getAllDateStates() {
        return { ...dateStates }; // Return a copy to prevent external modification
    }

    return {
        getDateState,
        setDateState,
        isPublicHoliday,
        getAllDateStates
    };
})();
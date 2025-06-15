// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // Developer-controlled variable for weekly summary visibility
    const SHOW_WEEKLY_SUMMARY_FOR_DEV = false; 

    // Get reference to the calendar container
    const calendarContainer = document.querySelector('.calendar-container');

    // Get reference to the Day/Night mode toggle switch
    const dayNightModeToggle = document.getElementById('dayNightModeToggle');
    const BODY_DARK_MODE_KEY = 'calendarDarkModeEnabled'; // Key for localStorage

    /**
     * Applies or removes the 'dark-mode' class from the body element
     * based on the provided boolean. Also saves preference to localStorage.
     * @param {boolean} enable - True to enable dark mode, false to disable.
     */
    function setDarkMode(enable) {
        if (enable) {
            document.body.classList.add('dark-mode');
            localStorage.setItem(BODY_DARK_MODE_KEY, 'true');
            dayNightModeToggle.checked = true; // Ensure switch matches state
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem(BODY_DARK_MODE_KEY, 'false');
            dayNightModeToggle.checked = false; // Ensure switch matches state
        }
    }

    /**
     * Initializes dark mode preference from localStorage or default.
     */
    function initializeDarkMode() {
        const savedMode = localStorage.getItem(BODY_DARK_MODE_KEY);
        // Default to false (light mode) if no preference saved
        const enableDarkMode = (savedMode === 'true');
        setDarkMode(enableDarkMode);
    }

    /**
     * This function is the central callback for when a date tile's state changes,
     * or when the month changes, or when data is reset.
     * It triggers recalculations and UI updates across the calendar.
     */
    function onDateStateChange() {
        const currentMonthYear = calendarGenerator.getCurrentMonthYear();
        const calculationResults = calculationEngine.recalculateAll(currentMonthYear);
        
        // Update main C value (Total Office Days)
        uiUpdater.updateCValue(calculationResults.totalC);
        
        // Update the compliance status based on totalC
        uiUpdater.updateComplianceStatus(calculationResults.totalC);

        // Update weekly A and B values
        uiUpdater.updateWeeklyABValues(calculationResults.weeklyData);

        // Update the new leaves taken counts
        uiUpdater.updateLeavesTakenCount(calculationResults.totalLeavesTaken);
        uiUpdater.updateOptionalLeavesTakenCount(calculationResults.totalOptionalLeavesTaken);
    }

    // --- INITIALIZATION ---
    initializeDarkMode(); // Initialize dark mode preference first

    // Initial rendering of the calendar
    calendarGenerator.renderCalendar((tile) => {
        // This callback is executed for each tile after it's rendered by calendarGenerator.
        // We use it to attach the click listener via eventHandlers.
        eventHandlers.attachTileClickListener(tile, onDateStateChange);
    });

    // Perform initial calculations and UI updates after the calendar is first rendered
    onDateStateChange();

    // --- EVENT LISTENERS ---

    // Month navigation buttons
    document.getElementById('prev-month-btn').addEventListener('click', () => {
        calendarGenerator.prevMonth();
        calendarGenerator.renderCalendar((tile) => {
            eventHandlers.attachTileClickListener(tile, onDateStateChange);
        });
        onDateStateChange(); // Recalculate and update UI after month change
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
        calendarGenerator.nextMonth();
        calendarGenerator.renderCalendar((tile) => {
            eventHandlers.attachTileClickListener(tile, onDateStateChange);
        });
        onDateStateChange(); // Recalculate and update UI after month change
    });

    // Reset month button
    document.getElementById('reset-month-data-btn').addEventListener('click', () => {
        const currentMonthYear = calendarGenerator.getCurrentMonthYear();
        dataManager.clearMonthData(currentMonthYear.year, currentMonthYear.month);
        calendarGenerator.renderCalendar((tile) => {
            eventHandlers.attachTileClickListener(tile, onDateStateChange);
        });
        onDateStateChange(); // Recalculate and update UI after reset
    });

    // Day/Night Mode Toggle Switch
    dayNightModeToggle.addEventListener('change', (event) => {
        setDarkMode(event.target.checked);
    });

    // Control visibility of weekly summary sections based on developer variable
    if (SHOW_WEEKLY_SUMMARY_FOR_DEV === false) {
        calendarContainer.classList.add('hide-weekly-summary');
    } else {
        calendarContainer.classList.remove('hide-weekly-summary');
    }
});
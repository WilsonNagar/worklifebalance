// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // NEW: Developer-controlled variable for weekly summary visibility
    // Set to 'false' to hide the Expected Working Days and Office Days sections by default for users.
    // Set to 'true' to show them (for developer testing).
    const SHOW_WEEKLY_SUMMARY_FOR_DEV = false; 

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

    // Initial rendering of the calendar
    calendarGenerator.renderCalendar((tile) => {
        // This callback is executed for each tile after it's rendered by calendarGenerator.
        // We use it to attach the click listener via eventHandlers.
        eventHandlers.attachTileClickListener(tile, onDateStateChange);
    });

    // Perform initial calculations and UI updates after the calendar is first rendered
    onDateStateChange();

    // Add event listeners for month navigation buttons
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

    // Add event listener for the reset month button
    document.getElementById('reset-month-data-btn').addEventListener('click', () => {
        const currentMonthYear = calendarGenerator.getCurrentMonthYear();
        dataManager.clearMonthData(currentMonthYear.year, currentMonthYear.month);
        calendarGenerator.renderCalendar((tile) => {
            eventHandlers.attachTileClickListener(tile, onDateStateChange);
        });
        onDateStateChange(); // Recalculate and update UI after reset
    });

    // Removed: Get reference to the checkbox and its event listener

    // NEW: Control visibility of weekly summary sections based on developer variable
    const calendarContainer = document.querySelector('.calendar-container');
    if (SHOW_WEEKLY_SUMMARY_FOR_DEV === false) {
        calendarContainer.classList.add('hide-weekly-summary');
    } else {
        calendarContainer.classList.remove('hide-weekly-summary');
    }
});
// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    /**
     * This function is the central callback for when a date tile's state changes.
     * It triggers recalculations and UI updates across the calendar.
     */
    function onDateStateChange() {
        const currentMonthYear = calendarGenerator.getCurrentMonthYear();
        const calculationResults = calculationEngine.recalculateAll(currentMonthYear);
        uiUpdater.updateCValue(calculationResults.totalC);
        uiUpdater.updateWeeklyABValues(calculationResults.weeklyData);
    }

    // Initial rendering of the calendar
    calendarGenerator.renderCalendar((tile) => {
        // This callback is executed for each tile after it's rendered by calendarGenerator.
        // We use it to attach the click listener via eventHandlers.
        eventHandlers.attachTileClickListener(tile, onDateStateChange);
    });

    // Perform initial calculations and UI updates after the calendar is first rendered
    onDateStateChange();

    // Future: Add event listeners for month navigation buttons if implemented
    // Example:
    // document.getElementById('prev-month-btn').addEventListener('click', () => {
    //     calendarGenerator.prevMonth();
    //     calendarGenerator.renderCalendar((tile) => {
    //         eventHandlers.attachTileClickListener(tile, onDateStateChange);
    //     });
    //     onDateStateChange(); // Recalculate and update UI after month change
    // });
    // document.getElementById('next-month-btn').addEventListener('click', () => {
    //     calendarGenerator.nextMonth();
    //     calendarGenerator.renderCalendar((tile) => {
    //         eventHandlers.attachTileClickListener(tile, onDateStateChange);
    //     });
    //     onDateStateChange(); // Recalculate and update UI after month change
    // });
});
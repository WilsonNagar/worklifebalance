// js/uiUpdater.js

const uiUpdater = (function() {
    const totalOfficeDaysSpan = document.getElementById('office-days-count');
    const calendarBody = document.getElementById('calendar-body');
    // NEW: Get references to the new count spans
    const leavesTakenCountSpan = document.getElementById('leaves-taken-count');
    const optionalLeavesTakenCountSpan = document.getElementById('optional-leaves-taken-count');


    /**
     * Updates the total "Office Days" (C value) displayed at the top.
     * @param {number} cValue - The calculated total eligible days for the month.
     */
    function updateCValue(cValue) {
        totalOfficeDaysSpan.textContent = cValue;
    }

    /**
     * Updates the A and B values displayed next to each week.
     * @param {Array<object>} weeklyData - An array of objects, each containing { weekIndex, A, B }.
     */
    function updateWeeklyABValues(weeklyData) {
        // Ensure that the calendarGenerator creates the .week-summary-a and .week-summary-b elements
        // with data-week-index. uiUpdater just fills their values.

        weeklyData.forEach(weekData => {
            const weekSummaryAElement = calendarBody.querySelector(`.week-summary-a[data-week-index="${weekData.weekIndex}"]`);
            const weekSummaryBElement = calendarBody.querySelector(`.week-summary-b[data-week-index="${weekData.weekIndex}"]`);

            if (weekSummaryAElement) {
                weekSummaryAElement.querySelector('.value').textContent = weekData.A;
            }
            if (weekSummaryBElement) {
                weekSummaryBElement.querySelector('.value').textContent = weekData.B;
            }
        });
    }

    /**
     * NEW: Updates the count of all leaves taken.
     * @param {number} count - The total number of leaves taken.
     */
    function updateLeavesTakenCount(count) {
        leavesTakenCountSpan.textContent = count;
    }

    /**
     * NEW: Updates the count of optional leaves taken.
     * @param {number} count - The total number of optional leaves taken.
     */
    function updateOptionalLeavesTakenCount(count) {
        optionalLeavesTakenCountSpan.textContent = count;
    }


    return {
        updateCValue,
        updateWeeklyABValues,
        updateLeavesTakenCount, // NEW: Expose new function
        updateOptionalLeavesTakenCount // NEW: Expose new function
    };
})();
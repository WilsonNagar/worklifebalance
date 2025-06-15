// js/uiUpdater.js

const uiUpdater = (function() {
    const totalOfficeDaysSpan = document.getElementById('office-days-count');
    const calendarBody = document.getElementById('calendar-body');
    const leavesTakenCountSpan = document.getElementById('leaves-taken-count');
    const optionalLeavesTakenCountSpan = document.getElementById('optional-leaves-taken-count');

    const complianceStatusDiv = document.querySelector('.compliance-status');
    const complianceIconSpan = complianceStatusDiv.querySelector('.compliance-icon'); // Icon handled by CSS
    const complianceTextSpan = complianceStatusDiv.querySelector('.compliance-text');


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
     * Updates the count of all leaves taken.
     * @param {number} count - The total number of leaves taken.
     */
    function updateLeavesTakenCount(count) {
        leavesTakenCountSpan.textContent = count;
    }

    /**
     * Updates the count of optional leaves taken.
     * @param {number} count - The total number of optional leaves taken.
     */
    function updateOptionalLeavesTakenCount(count) {
        optionalLeavesTakenCountSpan.textContent = count;
    }

    /**
     * Updates the compliance status based on the total C value.
     * @param {number} totalC - The total C value (Total Office Days).
     */
    function updateComplianceStatus(totalC) {
        if (totalC === 0) {
            complianceStatusDiv.classList.remove('non-compliant');
            complianceStatusDiv.classList.add('compliant');
            complianceTextSpan.textContent = 'COMPLIANT'; // Changed text
        } else {
            complianceStatusDiv.classList.remove('compliant');
            complianceStatusDiv.classList.add('non-compliant');
            complianceTextSpan.textContent = 'NON COMPLIANT'; // Changed text
        }
    }


    return {
        updateCValue,
        updateWeeklyABValues,
        updateLeavesTakenCount,
        updateOptionalLeavesTakenCount,
        updateComplianceStatus
    };
})();
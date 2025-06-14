// js/calculationEngine.js

const calculationEngine = (function() {

    // Internal cache for calculated values to optimize performance if needed, though for a single month, direct calculation is fine.
    let currentMonthAValues = {}; // Stores A values for each week
    let currentMonthBValues = {}; // Stores B values for each week
    let currentMonthCValue = 0;   // Stores the total C value for the month

    /**
     * Calculates A (number of working days) for a given week.
     * @param {Array<object>} weekDates - An array of date objects for the week.
     * Each object: { date: Date, dateString: 'YYYY-MM-DD' }
     * @returns {number} The count of working days.
     */
    function calculateA(weekDates) {
        let workingDaysCount = 0;
        weekDates.forEach(day => {
            const date = day.date;
            const dateString = day.dateString;
            const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday...

            // Condition 1: It should be between Monday (1) to Friday (5)
            // Condition 2: It should not be a public holiday
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !dataManager.isPublicHoliday(dateString)) {
                workingDaysCount++;
            }
        });
        return workingDaysCount;
    }

    /**
     * Calculates B (number of eligible days) for a given week.
     * @param {Array<object>} weekDates - An array of date objects for the week.
     * @param {number} A_value - The calculated A value for this week.
     * @returns {number} The count of eligible days.
     */
    function calculateB(weekDates, A_value) {
        let leavesInWeek = 0;
        weekDates.forEach(day => {
            const date = day.date;
            const dateString = day.dateString;
            const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday...

            // Only count leaves on Monday-Friday that are not public holidays
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !dataManager.isPublicHoliday(dateString)) {
                if (dataManager.getDateState(dateString) === 'leave') {
                    leavesInWeek++;
                }
            }
        });

        const X = Math.max(A_value - 2, 0); // min(A - 2, 0) is equivalent to max(A - 2, 0) for non-negative results
                                          // as we want X to be 0 if A-2 is negative.

        if (leavesInWeek < X) {
            return X;
        } else {
            return 0;
        }
    }

    /**
     * Recalculates A, B for all weeks and C for the entire month.
     * This function will iterate through all days of the current month
     * to group them by week and perform calculations.
     * @param {{month: number, year: number}} currentMonthYear - The currently displayed month and year.
     * @returns {{weeklyData: Array<object>, totalC: number}} An object containing
     * an array of weekly A and B values, and the total C value.
     */
    function recalculateAll(currentMonthYear) {
        const { month, year } = currentMonthYear;
        const allDateStates = dataManager.getAllDateStates(); // Get all states once for efficiency

        currentMonthAValues = {};
        currentMonthBValues = {};
        currentMonthCValue = 0;

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adjust first day of week for Monday start (0=Sunday becomes 6)
        let dayOffset = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday...
        dayOffset = dayOffset === 0 ? 6 : dayOffset - 1; // Now 0 for Monday, ..., 6 for Sunday

        let week = [];
        let weekIndex = 0;
        const weeklyCalculations = []; // To store A, B for each week

        // Add placeholder days for the start of the first week if month doesn't start on Monday
        for (let i = 0; i < dayOffset; i++) {
            week.push(null); // Placeholder for empty cells before 1st of month
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            week.push({ date: date, dateString: dateString });

            // If it's the end of the week (Sunday, or last day of month)
            if (date.getDay() === 0 || day === daysInMonth) { // getDay() returns 0 for Sunday
                // Ensure the week has 7 days before calculating, pad if it's the last week of the month
                while (week.length < 7) {
                    week.push(null); // Pad with nulls for remaining days in the week
                }

                // Filter out nulls for calculation (these are empty cells for display)
                const actualWeekDays = week.filter(d => d !== null);

                const A = calculateA(actualWeekDays);
                const B = calculateB(actualWeekDays, A);

                currentMonthAValues[weekIndex] = A;
                currentMonthBValues[weekIndex] = B;
                currentMonthCValue += B;

                weeklyCalculations.push({ weekIndex: weekIndex, A: A, B: B });

                week = []; // Start a new week
                weekIndex++;
            }
        }
        
        return {
            weeklyData: weeklyCalculations,
            totalC: currentMonthCValue
        };
    }

    return {
        recalculateAll,
        // You could add getters for currentMonthAValues, currentMonthBValues, currentMonthCValue if needed externally
        // but for now, recalculateAll returns them.
    };
})();
// js/calculationEngine.js

const calculationEngine = (function() {

    // Internal cache for calculated values. While not strictly returned,
    // they can be useful for debugging or future extensions.
    // Let's make them local variables within recalculateAll for clarity as they are session-specific.
    // Removed currentMonthAValues, currentMonthBValues, currentMonthCValue from outer scope
    // as they are recalculated fully each time.

    /**
     * Calculates A (number of working days) for a given week.
     * @param {Array<object>} weekDates - An array of date objects for the week.
     * Each object: { date: Date, dateString: 'YYYY-MM-DD' }
     * @returns {number} The count of working days.
     */
    function calculateA(weekDates) {
        let workingDaysCount = 0;
        weekDates.forEach(day => {
            if (day === null) return; // Skip null placeholders
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
            if (day === null) return; // Skip null placeholders
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

        // Variables to accumulate values for the entire month
        let totalSumBForMonth = 0; // Accumulates sum of 'B' values for the month (new)
        let userSelectedWorkingDaysCount = 0; // Counts user-selected 'working' days (new)
        
        // Debugging log: Start of recalculation
        console.log(`--- Recalculating for ${month + 1}/${year} ---`);

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adjust first day of week for Monday start (0=Sunday becomes 6)
        let dayOffset = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday...
        dayOffset = dayOffset === 0 ? 6 : dayOffset - 1; // Now 0 for Monday, ..., 6 for Sunday

        let week = [];
        let weekIndex = 0;
        const weeklyCalculations = []; // To store A, B for each week to be returned

        // Add placeholder days for the start of the first week if month doesn't start on Monday
        for (let i = 0; i < dayOffset; i++) {
            week.push(null); // Placeholder for empty cells before 1st of month
        }

        // Loop through all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday...

            // Check if this day is an eligible working day (Mon-Fri, not public holiday)
            // AND if it's marked 'working' by the user. This contributes to the subtraction for C.
            const isEligibleForUserWorkingCount = (dayOfWeek >= 1 && dayOfWeek <= 5 && !dataManager.isPublicHoliday(dateString));
            const currentState = dataManager.getDateState(dateString);

            // Debugging log: Individual day's status
            console.log(`Day: ${dateString}, DayOfWeek: ${dayOfWeek}, IsPublicHoliday: ${dataManager.isPublicHoliday(dateString)}, State: ${currentState}, Eligible for UserWorking Count: ${isEligibleForUserWorkingCount}`);

            if (isEligibleForUserWorkingCount && currentState === 'working') {
                userSelectedWorkingDaysCount++;
                console.log(`  -> Day ${dateString} is a user-selected 'working' day. Current userSelectedWorkingDaysCount: ${userSelectedWorkingDaysCount}`);
            }

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
                const B = calculateB(actualWeekDays, A); // B needs A

                totalSumBForMonth += B; // Accumulate B values for the month's total B (new)

                // Debugging log: Weekly summary
                console.log(`--- End of Week (or month) Summary ---`);
                console.log(`  Week Index: ${weekIndex}, A for this week: ${A}, B for this week: ${B}`);
                console.log(`  Cumulative totalSumBForMonth: ${totalSumBForMonth}`); // Log the accumulated B sum
                console.log(`------------------------------------`);
                
                weeklyCalculations.push({ weekIndex: weekIndex, A: A, B: B });

                week = []; // Start a new week
                weekIndex++;
            }
        }
        
        // Calculate the final C value using the NEW formula: max(SumB - UserWorking, 0)
        const finalCValue = Math.max(totalSumBForMonth - userSelectedWorkingDaysCount, 0); // This is the corrected formula

        // Debugging log: Final results
        console.log(`=== Final Calculation Results for ${month + 1}/${year} ===`);
        console.log(`Total Sum of B for Month (totalSumBForMonth): ${totalSumBForMonth}`);
        console.log(`User Selected Working Days Count (userSelectedWorkingDaysCount): ${userSelectedWorkingDaysCount}`);
        console.log(`Final C Value (max(SumB - UserWorking, 0)): ${finalCValue}`); // Updated formula text
        console.log(`================================================`);

        return {
            weeklyData: weeklyCalculations,
            totalC: finalCValue
        };
    }

    return {
        recalculateAll,
    };
})();
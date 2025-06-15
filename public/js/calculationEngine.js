// js/calculationEngine.js

const calculationEngine = (function() {

    /**
     * Calculates A (number of working days) for a given week.
     * A is simply Mon-Fri, not a public holiday.
     * @param {Array<object>} weekDates - An array of date objects for the week.
     * @returns {number} The count of working days.
     */
    function calculateA(weekDates) {
        let workingDaysCount = 0;
        weekDates.forEach(day => {
            if (day === null) return; // Skip null placeholders
            const date = day.date;
            const dateString = day.dateString;
            const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday...

            // A is for Mon-Fri, not a public holiday. Optional holiday status or user-state does not affect A.
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !dataManager.isPublicHoliday(dateString)) {
                workingDaysCount++;
            }
        });
        return workingDaysCount;
    }

    /**
     * Calculates B (number of eligible days) for a given week.
     * B becomes 0 if leavesInWeek (including optional leaves marked leave) >= X.
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

            // Count leaves on Mon-Fri that are not public holidays. This *includes* optional holidays if marked 'leave'.
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !dataManager.isPublicHoliday(dateString)) {
                if (dataManager.getDateState(dateString) === 'leave') {
                    leavesInWeek++;
                }
            }
        });

        const X = Math.max(A_value - 2, 0);

        if (leavesInWeek < X) {
            return X;
        } else {
            return 0; // B becomes 0 if leavesInWeek is X or higher
        }
    }

    /**
     * Recalculates A, B for all weeks and C for the entire month,
     * and also calculates total leaves and optional leaves taken,
     * applying the conditional logic for optional leave contribution to C.
     * @param {{month: number, year: number}} currentMonthYear - The currently displayed month and year.
     * @returns {{weeklyData: Array<object>, totalC: number, totalLeavesTaken: number, totalOptionalLeavesTaken: number}}
     * An object containing weekly A and B values, the total C value, and new leave counts.
     */
    function recalculateAll(currentMonthYear) {
        const { month, year } = currentMonthYear;

        let totalSumBForMonth = 0;
        let userSelectedWorkingDaysCount = 0;
        let totalLeavesTaken = 0; // Counts regular leaves
        let totalOptionalLeavesTaken = 0; // Counts optional holidays marked as 'leave'
        let optionalLeavesToSubtractFromC = 0; // Conditional sum for C's formula

        // Debugging log: Start of recalculation
        console.log(`--- Recalculating for ${month + 1}/${year} ---`);
        
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let dayOffset = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday...
        dayOffset = dayOffset === 0 ? 6 : dayOffset - 1; // Now 0 for Monday, ..., 6 for Sunday

        let week = [];
        let weekIndex = 0;
        const weeklyCalculations = [];

        // Add placeholder days for the start of the first week if month doesn't start on Monday
        for (let i = 0; i < dayOffset; i++) {
            week.push(null);
        }

        // Loop through all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday...
            const isPublicHoliday = dataManager.isPublicHoliday(dateString);
            const isOptionalHoliday = dataManager.isOptionalHoliday(dateString);
            const currentState = dataManager.getDateState(dateString);

            // Accumulate user-selected working days for C calculation
            const isEligibleForUserWorkingCount = (dayOfWeek >= 1 && dayOfWeek <= 5 && !isPublicHoliday);
            if (isEligibleForUserWorkingCount && currentState === 'working') {
                userSelectedWorkingDaysCount++;
            }

            // CORRECTED LOGIC: Mutually exclusive counting for Leaves Taken and Optional Leaves Taken
            if (currentState === 'leave') {
                if (isOptionalHoliday) {
                    totalOptionalLeavesTaken++; // This is an optional leave
                } else {
                    totalLeavesTaken++; // This is a regular leave (not an optional holiday)
                }
            }
            
            week.push({ date: date, dateString: dateString });

            // If it's the end of the week (Sunday, or last day of month)
            if (date.getDay() === 0 || day === daysInMonth) {
                while (week.length < 7) {
                    week.push(null);
                }

                const actualWeekDays = week.filter(d => d !== null);

                const A = calculateA(actualWeekDays);
                const B = calculateB(actualWeekDays, A);

                totalSumBForMonth += B;

                // Conditional accumulation for optionalLeavesToSubtractFromC
                if (B !== 0) { // If B for this week is NOT 0 (i.e., leavesInWeek < X)
                    let optionalLeavesInThisWeek = 0;
                    actualWeekDays.forEach(dayInWeek => {
                        if (dayInWeek === null) return;
                        if (dataManager.isOptionalHoliday(dayInWeek.dateString) && dataManager.getDateState(dayInWeek.dateString) === 'leave') {
                            optionalLeavesInThisWeek++;
                        }
                    });
                    optionalLeavesToSubtractFromC += optionalLeavesInThisWeek;
                }
                
                // Debugging log: Weekly summary (can be commented out if too verbose)
                console.log(`--- End of Week (or month) Summary ---`);
                console.log(`  Week Index: ${weekIndex}, A: ${A}, B: ${B}`);
                console.log(`  Optional Leaves contributing to C subtraction for this week: ${optionalLeavesToSubtractFromC - (weeklyCalculations[weekIndex-1]?.optionalLeavesToSubtractFromC || 0)}`); // Show weekly delta
                console.log(`  Cumulative totalSumBForMonth: ${totalSumBForMonth}`);
                console.log(`  Cumulative optionalLeavesToSubtractFromC: ${optionalLeavesToSubtractFromC}`);
                console.log(`------------------------------------`);
                
                weeklyCalculations.push({ weekIndex: weekIndex, A: A, B: B });

                week = []; // Start a new week
                weekIndex++;
            }
        }
        
        // Calculate the final C value using the formula: max(totalB - working days - optional holiday leaves (conditional), 0)
        const finalCValue = Math.max(totalSumBForMonth - userSelectedWorkingDaysCount - optionalLeavesToSubtractFromC, 0);

        // Debugging log: Final results
        console.log(`=== Final Calculation Results for ${month + 1}/${year} ===`);
        console.log(`Total Sum of B for Month (totalSumBForMonth): ${totalSumBForMonth}`);
        console.log(`User Selected Working Days Count (userSelectedWorkingDaysCount): ${userSelectedWorkingDaysCount}`);
        console.log(`Total Leaves Taken (excluding optional leaves): ${totalLeavesTaken}`); // Clarified log
        console.log(`Total Optional Leaves Taken (for display): ${totalOptionalLeavesTaken}`); // Clarified log
        console.log(`Optional Leaves contributing to C subtraction (conditional): ${optionalLeavesToSubtractFromC}`);
        console.log(`Final C Value (max(SumB - UserWorking - ConditionalOptionalHolidayLeaves, 0)): ${finalCValue}`);
        console.log(`================================================`);

        return {
            weeklyData: weeklyCalculations,
            totalC: finalCValue,
            totalLeavesTaken: totalLeavesTaken,
            totalOptionalLeavesTaken: totalOptionalLeavesTaken
        };
    }

    // Helper function for debugging (not part of core calculation)
    function leavesInWeek(weekDates) {
        let count = 0;
        weekDates.forEach(day => {
            if (day === null) return;
            const date = day.date;
            const dateString = day.dateString;
            const dayOfWeek = date.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && !dataManager.isPublicHoliday(dateString)) {
                if (dataManager.getDateState(dateString) === 'leave') {
                    count++;
                }
            }
        });
        return count;
    }

    return {
        recalculateAll,
    };
})();
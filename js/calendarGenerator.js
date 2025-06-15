// js/calendarGenerator.js (UPDATED renderCalendar FUNCTION)

const calendarGenerator = (function() {
    const calendarBody = document.getElementById('calendar-body');
    const currentMonthYearHeader = document.getElementById('current-month-year');

    let currentMonth = new Date().getMonth(); // 0-indexed
    let currentYear = new Date().getFullYear();

    /**
     * Renders the calendar for the current month and year.
     * @param {function} onTileRenderedCallback - Callback function to run after each tile is rendered,
     * useful for attaching event listeners.
     */
    function renderCalendar(onTileRenderedCallback) {
        calendarBody.innerHTML = ''; // Clear previous calendar

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Calculate the starting day of the week (0 for Monday, 6 for Sunday)
        let firstDayGridIndex = firstDayOfMonth.getDay(); // 0=Sunday, 1=Monday...
        if (firstDayGridIndex === 0) { // If Sunday, it's the 6th position (index 6) in our Mon-start week
            firstDayGridIndex = 6;
        } else { // For Mon-Sat, adjust to be 0-indexed for Monday
            firstDayGridIndex--;
        }

        currentMonthYearHeader.textContent = `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${currentYear}`;

        let dayOfMonth = 1; // Tracks the current day number of the month being placed
        let weekCounter = 0; // To uniquely identify weeks for A/B values

        // Loop for up to 6 potential weeks (rows) in a month
        for (let i = 0; i < 6; i++) {
            let rowHasActualDate = false; // Flag to check if this grid row contains any actual date tiles

            // Loop for 7 days + 2 summary columns in each grid row (total 9 columns)
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');

                if (j < 7) { // This is a date tile column (first 7 columns)
                    // Calculate the overall position in the grid if it were just date cells
                    const overallDateCellIndex = (i * 7) + j; 

                    // Check if this position is before the first day of the month
                    // OR if we've already placed all days of the month
                    if (overallDateCellIndex < firstDayGridIndex || dayOfMonth > daysInMonth) {
                        cell.classList.add('date-tile', 'empty');
                    } else { // This is an actual date cell
                        const date = new Date(currentYear, currentMonth, dayOfMonth);
                        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
                        const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday...

                        cell.classList.add('date-tile');
                        cell.textContent = dayOfMonth;
                        cell.dataset.date = dateString; // Store date string for easy access

                        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 = Sunday, 6 = Saturday
                        const isPublicHoliday = dataManager.isPublicHoliday(dateString);
                        const isOptionalHoliday = dataManager.isOptionalHoliday(dateString); // NEW: Check for optional holiday

                        // Apply red class for weekends and public holidays (not clickable)
                        if (isWeekend || isPublicHoliday) {
                            cell.classList.add('red');
                        } else {
                            // For regular days and optional holidays, apply existing state
                            const state = dataManager.getDateState(dateString);
                            cell.classList.add(state); // 'normal', 'leave', 'working'
                        }
                        
                        // NEW: Apply optional-holiday class if it's an optional holiday
                        if (isOptionalHoliday) {
                            cell.classList.add('optional-holiday');
                        }

                        // Call the callback for event listeners (only for clickable tiles)
                        // Important: Red tiles are not clickable, so only attach listener if not red.
                        if (!cell.classList.contains('red') && onTileRenderedCallback) {
                             onTileRenderedCallback(cell);
                        }
                        dayOfMonth++; // Move to the next day for the next cell
                        rowHasActualDate = true; // Mark that this row contains at least one actual date
                    }
                } else { // This is an A or B summary column (columns 8 and 9)
                    cell.classList.add('week-summary', 'empty-summary'); // Add empty-summary for initial state
                    cell.innerHTML = '<div class="value"></div>'; // Placeholder for value

                    if (j === 7) { // 8th column is for A value
                        cell.classList.add('week-summary-a');
                    } else { // 9th column is for B value
                        cell.classList.add('week-summary-b');
                    }
                    cell.dataset.weekIndex = weekCounter; // Assign week index for uiUpdater
                }
                calendarBody.appendChild(cell);
            }
            
            // After each full 9-column row, check if we need to continue to the next row.
            // If the previous row did not contain any actual dates and all days of the month have been placed,
            // we can stop generating more rows.
            if (dayOfMonth > daysInMonth && !rowHasActualDate) {
                break; 
            }
            // Increment week counter only if this row contained at least one actual date
            // or if it was a row with leading empty days that would contain dates later in the week.
            if (rowHasActualDate || (i === 0 && firstDayGridIndex > 0) || (dayOfMonth <= daysInMonth)) {
                 weekCounter++;
            }
        }
    }

    // --- The following functions remain unchanged ---
    function nextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }

    function prevMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    }

    function getCurrentMonthYear() {
        return { month: currentMonth, year: currentYear };
    }

    return {
        renderCalendar,
        nextMonth,
        prevMonth,
        getCurrentMonthYear
    };
})();
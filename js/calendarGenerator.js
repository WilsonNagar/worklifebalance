// js/calendarGenerator.js (UPDATED renderCalendar FUNCTION)

const calendarGenerator = (function() {
    const calendarBody = document.getElementById('calendar-body');
    const currentMonthYearHeader = document.getElementById('current-month-year');

    let currentMonth = new Date().getMonth(); // 0-indexed
    let currentYear = new Date().getFullYear();

    /**
     * Helper function to get the state/holiday text for a tile.
     * @param {string} state - The current state of the tile ('normal', 'leave', 'working').
     * @param {string|undefined} publicHolidayName - The name of the public holiday, or undefined.
     * @param {string|undefined} optionalHolidayName - The name of the optional holiday, or undefined.
     * @returns {{stateText: string, holidayNameText: string}} Object with the two text lines.
     */
    function getTileTexts(state, publicHolidayName, optionalHolidayName) {
        let stateText = '';
        let holidayNameText = '';

        if (publicHolidayName) {
            holidayNameText = publicHolidayName; // Public holidays always show their name
            stateText = ''; // No WFO/WFH/Leave text for public holidays
        } else if (optionalHolidayName) {
            // Optional Holiday specific logic
            if (state === 'leave') {
                stateText = 'Optional Holiday'; // "Optional Holiday" for optional leaves
                holidayNameText = optionalHolidayName; // And its name
            } else if (state === 'working') {
                stateText = 'WFO'; // "WFO" if optional holiday is working
                holidayNameText = optionalHolidayName; // Still show name
            } else { // Normal or other states for optional holiday
                stateText = ''; // Default empty for normal optional holiday
                holidayNameText = optionalHolidayName; // Just show its name
            }
        } else {
            // Regular days (not public/optional holidays)
            if (state === 'normal') {
                stateText = 'WFH'; // "WFH" for normal working days
            } else if (state === 'leave') {
                stateText = 'Leave'; // "Leave" for regular leaves
            } else if (state === 'working') {
                stateText = 'WFO'; // "WFO" for regular working days
            }
        }

        return { stateText, holidayNameText };
    }


    /**
     * Renders the calendar for the current month and year.
     * @param {function} onTileRenderedCallback - Callback function to run after each tile is rendered,
     * useful for attaching event listeners.
     */
    function renderCalendar(onTileRenderedCallback) {
        calendarBody.innerHTML = ''; // Clear previous calendar

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        let firstDayGridIndex = firstDayOfMonth.getDay();
        if (firstDayGridIndex === 0) {
            firstDayGridIndex = 6;
        } else {
            firstDayGridIndex--;
        }

        currentMonthYearHeader.textContent = `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${currentYear}`;

        let dayOfMonth = 1;
        let weekCounter = 0;

        for (let i = 0; i < 6; i++) {
            let rowHasActualDate = false;

            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');

                if (j < 7) { // Date tile column
                    const overallDateCellIndex = (i * 7) + j; 

                    if (overallDateCellIndex < firstDayGridIndex || dayOfMonth > daysInMonth) {
                        cell.classList.add('date-tile', 'empty');
                        // Add empty placeholders for text even in empty cells for consistent structure
                        cell.innerHTML = `
                            <span class="date-number"></span>
                            <span class="state-text"></span>
                            <span class="holiday-name-text"></span>
                        `;
                    } else { // Actual date cell
                        const date = new Date(currentYear, currentMonth, dayOfMonth);
                        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
                        const dayOfWeek = date.getDay();

                        cell.classList.add('date-tile');
                        cell.dataset.date = dateString; // Store date string

                        const publicHolidayName = dataManager.isPublicHoliday(dateString); // Now returns name or undefined
                        const optionalHolidayName = dataManager.isOptionalHoliday(dateString); // Now returns name or undefined

                        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
                        
                        let state = dataManager.getDateState(dateString); // Get stored state

                        // Determine classes and text based on holiday status and state
                        if (isWeekend || publicHolidayName) { // If public holiday, it takes precedence for 'red'
                            cell.classList.add('red'); // Non-clickable
                        } else {
                            cell.classList.add(state); // Apply normal/leave/working class
                        }
                        
                        if (optionalHolidayName) {
                            cell.classList.add('optional-holiday'); // Apply yellow border if optional
                        }

                        // Get text contents based on logic
                        const texts = getTileTexts(state, publicHolidayName, optionalHolidayName);

                        // Populate the tile with date number and new text spans
                        cell.innerHTML = `
                            <span class="date-number">${dayOfMonth}</span>
                            <span class="state-text">${texts.stateText}</span>
                            <span class="holiday-name-text">${texts.holidayNameText}</span>
                        `;

                        // Attach event listener only if not 'red'
                        if (!cell.classList.contains('red') && onTileRenderedCallback) {
                             onTileRenderedCallback(cell);
                        }
                        dayOfMonth++;
                        rowHasActualDate = true;
                    }
                } else { // A or B summary column
                    cell.classList.add('week-summary', 'empty-summary');
                    cell.innerHTML = '<div class="value"></div>';

                    if (j === 7) {
                        cell.classList.add('week-summary-a');
                    } else {
                        cell.classList.add('week-summary-b');
                    }
                    cell.dataset.weekIndex = weekCounter;
                }
                calendarBody.appendChild(cell);
            }
            
            if (dayOfMonth > daysInMonth && !rowHasActualDate) {
                break; 
            }
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
        getCurrentMonthYear,
        getTileTexts // Expose helper for eventHandlers to use
    };
})();
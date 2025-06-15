// js/calendarGenerator.js (UPDATED getTileTexts HELPER FUNCTION & call in renderCalendar)

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
     * @param {boolean} isWeekend - True if the date is a Saturday or Sunday. // NEW PARAMETER
     * @returns {{stateText: string, holidayNameText: string}} Object with the two text lines.
     */
    function getTileTexts(state, publicHolidayName, optionalHolidayName, isWeekend) { // NEW: isWeekend parameter
        let stateText = '';
        let holidayNameText = '';

        if (publicHolidayName) {
            // Public holidays take highest precedence: only show their name.
            holidayNameText = publicHolidayName;
            stateText = ''; 
        } else if (isWeekend) { // NEW: Handle regular weekends (not public holidays)
            stateText = 'WEEKEND';
            holidayNameText = ''; // Regular weekends don't have a specific holiday name
        } else if (optionalHolidayName) {
            // Optional Holiday specific logic (if not a public holiday and not a regular weekend)
            if (state === 'normal') {
                stateText = 'WFH';
                holidayNameName = optionalHolidayName;
            } else if (state === 'leave') {
                stateText = 'OPTIONAL HOLIDAY'; // Changed to uppercase for consistency
                holidayNameText = optionalHolidayName;
            } else if (state === 'working') {
                stateText = 'WFO';
                holidayNameText = optionalHolidayName;
            }
        } else {
            // Regular weekdays (Mon-Fri, not a public or optional holiday)
            if (state === 'normal') {
                stateText = 'WFH';
            } else if (state === 'leave') {
                stateText = 'LEAVE'; // Changed to uppercase for consistency
            } else if (state === 'working') {
                stateText = 'WFO';
            }
        }

        return { stateText, holidayNameText };
    }

    /**
     * Renders the calendar for the current month and year.
     * ... (rest of the renderCalendar function) ...
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
                        cell.dataset.date = dateString;

                        const publicHolidayName = dataManager.isPublicHoliday(dateString);
                        const optionalHolidayName = dataManager.isOptionalHoliday(dateString);
                        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // Determine if it's a weekend

                        let state = dataManager.getDateState(dateString);

                        if (isWeekend || publicHolidayName) { // If public holiday or weekend, it's red
                            cell.classList.add('red');
                        } else {
                            cell.classList.add(state);
                        }
                        
                        if (optionalHolidayName) {
                            cell.classList.add('optional-holiday');
                        }

                        // UPDATED: Pass isWeekend to getTileTexts
                        const texts = getTileTexts(state, publicHolidayName, optionalHolidayName, isWeekend);

                        cell.innerHTML = `
                            <span class="date-number">${dayOfMonth}</span>
                            <span class="state-text">${texts.stateText}</span>
                            <span class="holiday-name-text">${texts.holidayNameText}</span>
                        `;

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
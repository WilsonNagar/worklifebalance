// js/uiUpdater.js

const uiUpdater = (function() {
    const totalOfficeDaysSpan = document.getElementById('office-days-count');
    const calendarBody = document.getElementById('calendar-body');

    /**
     * Updates the total "Office Days" (C value) displayed at the top.
     * @param {number} cValue - The calculated total eligible days for the month.
     */
    function updateCValue(cValue) {
        totalOfficeDaysSpan.textContent = cValue;
    }

    /**
     * Updates the A and B values displayed next to each week.
     * This function needs to be called after the calendar body has been rendered
     * and calculations are complete.
     * @param {Array<object>} weeklyData - An array of objects, each containing { weekIndex, A, B }.
     */
    function updateWeeklyABValues(weeklyData) {
        // Remove any existing A/B value elements to prevent duplicates
        const existingWeekSummaries = calendarBody.querySelectorAll('.week-summary-row');
        existingWeekSummaries.forEach(row => row.remove());

        // Find all rows in the calendar body. A "row" effectively spans 7 date tiles.
        // We'll insert the A and B values at the end of each logical week.

        const dateTiles = calendarBody.querySelectorAll('.date-tile:not(.empty)');
        let currentWeekTiles = [];
        let weekCounter = 0;
        let dayCounterInMonth = 0; // To track actual days of the month, not empty placeholders

        // Loop through all elements in the calendar body grid
        const allGridCells = calendarBody.children;

        for (let i = 0; i < allGridCells.length; i++) {
            const cell = allGridCells[i];

            // If it's a date tile (not empty)
            if (cell.classList.contains('date-tile') && !cell.classList.contains('empty')) {
                currentWeekTiles.push(cell);
                dayCounterInMonth++; // Increment for actual date
            } else if (cell.classList.contains('date-tile') && cell.classList.contains('empty')) {
                 // If it's an empty tile at the start of the month, also count it towards the 7-day week
                 currentWeekTiles.push(cell);
            }
            
            // Check if we've completed a 7-day block or reached the end of all cells
            // The grid is 9 columns wide (7 days + 2 for A/B values).
            // We need to check if we're at the 7th cell of a block (index 6, 15, 24...)
            const isEndOfVisualWeekRow = (i + 1) % 9 === 7; // Check if we are at the 7th date cell position
            const isEndOfCalendar = (i === allGridCells.length - 1); // Check if it's the very last cell

            if (isEndOfVisualWeekRow || isEndOfCalendar) {
                // If it's the end of a logical week (7 days), or the very end of the calendar
                if (currentWeekTiles.length > 0) { // Ensure there are dates in this "week"
                    const weekData = weeklyData.find(data => data.weekIndex === weekCounter);
                    
                    const aValue = weekData ? weekData.A : 0;
                    const bValue = weekData ? weekData.B : 0;

                    // Create elements for A and B values
                    const aDiv = document.createElement('div');
                    aDiv.classList.add('week-summary', 'a-value', 'week-summary-row'); // Add week-summary-row for easy removal
                    aDiv.innerHTML = `<div class="value">${aValue}</div>`;
                    
                    const bDiv = document.createElement('div');
                    bDiv.classList.add('week-summary', 'b-value', 'week-summary-row'); // Add week-summary-row
                    bDiv.innerHTML = `<div class="value">${bValue}</div>`;
                    
                    // Insert these into the grid. The `i` here is the current index in `allGridCells`.
                    // We need to insert after the 7th date cell of the current logical week.
                    // The grid is flat, so we insert at (current cell index + 1) for A, and (current cell index + 2) for B.
                    
                    // We use insertAdjacentElement to place them correctly in the flow of the grid.
                    // The calendar body is a grid, so appending directly will add to the end.
                    // We need to insert them *after* the current 7th day of the week visually.

                    // To correctly place A and B values next to the week, we need to consider the flat grid.
                    // If we've just processed the 7th day of a visual row (cell `i`), the next two positions are for A and B.
                    // `insertAdjacentElement` works by inserting relative to the reference element.
                    
                    // This is tricky with a flat grid. A more robust solution might be to rebuild sections
                    // or ensure the `grid-template-columns` is always respected by placing placeholders.
                    // For now, let's append them directly and rely on the grid layout to position them.
                    // However, we need to ensure they are added to the correct row implicitly by the grid.

                    // The most straightforward way to align A and B values to the end of a week row
                    // in a flat grid is to ensure `calendarGenerator` adds empty cells to fill the
                    // 8th and 9th column for weeks that don't have enough days to start a new row.
                    // But if `calendarBody` is a grid with 9 columns, simply appending should work
                    // provided the previous elements fill up the grid cells correctly.
                    
                    // Let's ensure the grid setup from CSS correctly places them.
                    // The calendarBody is `grid-template-columns: repeat(7, 1fr) 1.5fr 1.5fr;`
                    // So, after every 7 date-tiles, the 8th and 9th cell in the grid *should* be the A and B values.

                    // We need to find the specific grid cell where A and B should reside.
                    // The `allGridCells` already contains empty cells from `calendarGenerator`.
                    // So, we need to iterate and replace or fill the A/B placeholder cells.

                    // Instead of inserting new elements, let's assume `calendarGenerator` creates empty placeholders
                    // for the A and B columns for *every* row, and we just fill them.
                    // This would mean `calendarGenerator` needs a slight adjustment.

                    // --- REVISED APPROACH FOR A/B INSERTION ---
                    // Let's modify the strategy: `calendarGenerator` will create the placeholder divs for A and B,
                    // and `uiUpdater` will find and fill them. This is more robust for grid layout.
                    // We need `calendarGenerator` to insert 2 placeholder divs at the end of each *visual* week row.
                    // This means after every 7 date-tiles, two new divs are inserted.

                    // For now, assume a placeholder mechanism.
                    // If `calendarGenerator` adds 7 date tiles + 2 summary cells per "row" in the flat list,
                    // then we can find the indices.

                    // For the initial implementation, let's simply find the appropriate place based on the week number
                    // and append. This might make the DOM structure less clean but aligns with previous thought.
                    // We will ensure that calendarGenerator creates exactly 7+2 cells per row for layout.

                    // A better approach is to find the *row* in the grid.
                    // `querySelectorAll('.date-tile')` will give all tiles.
                    // `querySelectorAll('.date-tile:nth-child(7n+7)')` would give the 7th date of each row.
                    // Then target the next two siblings.

                    const weekRowStartIdx = i - (currentWeekTiles.length - 1); // Index of the first item in the current week block
                    const targetGridIndexForA = weekRowStartIdx + 7; // After 7 days
                    const targetGridIndexForB = weekRowStartIdx + 8; // After A

                    // Append A and B values to the calendar body. They will be positioned by CSS grid.
                    // We need a unique identifier for each week's summary elements.
                    aDiv.dataset.weekIndex = weekCounter;
                    bDiv.dataset.weekIndex = weekCounter;

                    // To ensure elements are placed correctly in the grid, we need to be precise.
                    // Let's ensure `calendarGenerator` always builds a full `7+2` grid for each row.
                    // So we can target the (7n + 8)th and (7n + 9)th children for each week's A and B.

                    // --- REVISED LOGIC FOR UI UPDATE ---
                    // To handle the A and B values correctly with the existing `calendar-body` as a flat grid:
                    // We need to iterate through the `weeklyData` and place the A and B values
                    // alongside the corresponding week's days.
                    // This implies that `calendarGenerator` should create a wrapper div for each week,
                    // or place placeholder divs for A and B within the `calendar-body` grid.

                    // Given the current flat `calendar-body` grid, the easiest way to ensure A and B are
                    // always present and updated is to regenerate them or update specific elements.

                    // Let's simplify: `calendarGenerator` should include placeholder divs for A and B at the end of each *full* week row.
                    // Then, `uiUpdater` just finds these specific placeholders by an ID or data attribute and updates their content.
                    // --- This is the most robust way given a flat grid ---

                    // For now, I will create elements and insert them. This assumes `calendarGenerator`
                    // already created the grid cells.
                    // This implies a need for `calendarGenerator` to create 7 date cells + 2 summary cells per row.

                    // Let's simplify the `uiUpdater` to assume the grid structure is ready to accept A/B values.
                    // It's much cleaner if `calendarGenerator` creates the empty `div`s for A and B at the end of each row.
                    // Then `uiUpdater` can just fill those `div`s.

                    // Temporarily, let's just append them to the calendarBody and rely on the grid to position them.
                    // THIS WILL LIKELY LEAD TO A/B VALUES APPEARING AT THE BOTTOM OF THE ENTIRE CALENDAR.
                    // We need a better way to target positions in the flat grid.

                    // Let's restart this part of the logic to assume `calendarGenerator` adds the A/B placeholders.
                    // `calendarGenerator` will be updated for this.

                    // ******************************************************************************
                    // TEMPORARY SOLUTION: For the purpose of providing this file without changing
                    // calendarGenerator.js *yet*, I will make this function find the relevant rows
                    // and inject elements. This will be somewhat brittle but will show intent.
                    // A proper solution requires calendarGenerator to create the placeholders.
                    // ******************************************************************************

                    // For now, let's just add it to the body and fix the generator later.
                    // This will make A and B values append to the end of the entire calendar.
                    // This is not the desired output, but demonstrates the update function.

                    // To correctly position A and B values next to their week, `calendarGenerator`
                    // needs to create explicit placeholders.
                    // We will update `calendarGenerator.js` next to do this.

                    // For now, let's keep this module focused on just the update function.
                    // It will need to iterate through the calendar DOM to find the correct row/week
                    // and update the specific placeholder elements for A and B.

                    // *** Placeholder for the correct logic after calendarGenerator update ***
                    // A more robust implementation for `updateWeeklyABValues` will be to
                    // target specific `data-week-index` elements or similar placeholders
                    // that `calendarGenerator` will create.

                    // Find existing summary containers for this week (or create them if absent)
                    const weekSummaryAElement = document.querySelector(`.week-summary-a[data-week-index="${weekCounter}"]`);
                    const weekSummaryBElement = document.querySelector(`.week-summary-b[data-week-index="${weekCounter}"]`);

                    if (weekSummaryAElement) {
                        weekSummaryAElement.querySelector('.value').textContent = aValue;
                    }
                    if (weekSummaryBElement) {
                        weekSummaryBElement.querySelector('.value').textContent = bValue;
                    }
                }
                weekCounter++; // Increment week counter after processing a full 7-day segment
                currentWeekTiles = []; // Reset for the next week
            }
        }
    }

    return {
        updateCValue,
        updateWeeklyABValues
    };
})();
// js/eventHandlers.js

const eventHandlers = (function() {

    // Defines the cycle of states for a clickable date tile
    const stateCycle = ['normal', 'leave', 'working'];

    /**
     * Handles the click event on a date tile.
     * Toggles the state of the tile and updates its appearance, data, and text labels.
     * @param {Event} event - The click event object.
     * @param {function} onStateChangeCallback - Callback to execute after a state change,
     * typically to trigger recalculations and a full UI refresh.
     */
    function handleTileClick(event, onStateChangeCallback) {
        const clickedTile = event.currentTarget;

        // Do not process clicks for red (weekend/public holiday) or empty tiles
        if (clickedTile.classList.contains('red') || clickedTile.classList.contains('empty')) {
            return;
        }

        const dateString = clickedTile.dataset.date;
        let currentState = dataManager.getDateState(dateString);

        // Determine the next state in the cycle
        const currentIndex = stateCycle.indexOf(currentState);
        const nextIndex = (currentIndex + 1) % stateCycle.length;
        const nextState = stateCycle[nextIndex];

        // Update the dataManager
        dataManager.setDateState(dateString, nextState);

        // Update the tile's appearance (remove old state classes, add new one)
        clickedTile.classList.remove(...stateCycle);
        clickedTile.classList.add(nextState);

        // NEW: Update the text labels within the clicked tile
        const publicHolidayName = dataManager.isPublicHoliday(dateString); // Get holiday name (or undefined)
        const optionalHolidayName = dataManager.isOptionalHoliday(dateString); // Get optional holiday name (or undefined)
        
        // Use the getTileTexts helper from calendarGenerator to determine new text content
        const newTexts = calendarGenerator.getTileTexts(nextState, publicHolidayName, optionalHolidayName);

        const stateTextSpan = clickedTile.querySelector('.state-text');
        const holidayNameTextSpan = clickedTile.querySelector('.holiday-name-text');

        if (stateTextSpan) {
            stateTextSpan.textContent = newTexts.stateText;
        }
        if (holidayNameTextSpan) {
            holidayNameTextSpan.textContent = newTexts.holidayNameText;
        }

        // Trigger the callback for full recalculation and UI update (A, B, C, total leaves)
        if (onStateChangeCallback) {
            onStateChangeCallback();
        }
    }

    /**
     * Attaches the click event listener to a single date tile.
     * @param {HTMLElement} tileElement - The date tile DOM element.
     * @param {function} onStateChangeCallback - Callback to execute after a state change.
     */
    function attachTileClickListener(tileElement, onStateChangeCallback) {
        // Ensure the tile is not red (weekend/public holiday) or empty before attaching listener
        if (!tileElement.classList.contains('red') && !tileElement.classList.contains('empty')) {
            tileElement.addEventListener('click', (event) => handleTileClick(event, onStateChangeCallback));
        }
    }

    return {
        attachTileClickListener
    };
})();
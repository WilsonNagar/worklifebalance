// js/eventHandlers.js

const eventHandlers = (function() {

    // Defines the cycle of states for a clickable date tile
    const stateCycle = ['normal', 'leave', 'working'];

    /**
     * Handles the click event on a date tile.
     * Toggles the state of the tile and updates its appearance and data.
     * @param {Event} event - The click event object.
     * @param {function} onStateChangeCallback - Callback to execute after a state change,
     * typically to trigger recalculations.
     */
    function handleTileClick(event, onStateChangeCallback) {
        const clickedTile = event.currentTarget;

        // Do not process clicks for red (weekend/holiday) or empty tiles
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

        // Update the tile's appearance
        clickedTile.classList.remove(...stateCycle); // Remove all possible state classes
        clickedTile.classList.add(nextState); // Add the new state class

        // Trigger the callback for recalculation
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
        // Ensure the tile is not red (weekend/holiday) or empty before attaching listener
        if (!tileElement.classList.contains('red') && !tileElement.classList.contains('empty')) {
            tileElement.addEventListener('click', (event) => handleTileClick(event, onStateChangeCallback));
        }
    }

    return {
        attachTileClickListener
    };
})();
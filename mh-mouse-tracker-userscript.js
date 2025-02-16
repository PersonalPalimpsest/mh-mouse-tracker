// ==UserScript==
// @name         MouseHunt Mouse Tracker
// @namespace    http://tampermonkey.net/
// @version      0.7.1
// @description  Tracks mice caught in MouseHunt
// @author       You
// @match        https://www.mousehuntgame.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mousehuntgame.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @license      GPLv3
// ==/UserScript==

/* == CSS for Dark Mode == */
GM_addStyle(`
    /* --- Overall Tracker Container Styling --- */
    #mh-mouse-tracker-container {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        overflow: hidden; /* Prevent scrollbars during resize */
        background-color: #2a2a2a;
        color: #e0e0e0;
        border: 1px solid #444444;
        border-radius: 5px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.6);
        cursor: default;
        padding: 10px 2px 10px 10px;
        max-height: 95vh;   /* Maximum height to prevent going off-screen */
        min-height: 75px;    /* Minimum height for the container */
        font-size: math;
    }

    /* --- Title Bar Styling --- */
    #mh-mouse-tracker-container h3 {
        cursor: grab;
        margin: 0 0 10px 0;
        font-size: 1.2em;
        font-weight: bold;
        color: #f1f1f1;
        user-select: none; /* Prevent text selection while dragging */
        flex-shrink: 0;   /* Prevent title from shrinking */
        display: flex;      /* Use flexbox for title to align close button */
        justify-content: space-between; /* Push title text to left, button to right */
        align-items: center;    /* Vertically align title and button */
    }

    /* --- Close Button Styling in Title Bar --- */
    #mh-tracker-close-button {
        background: none;
        color: #e0e0e0;
        border: none;
        font-size: 1em;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.3s ease;
        margin-left: 10px; /* Add some space between title and close button */
		position: relative;
        top: -7px;         /* Squares up close button positioning */
    }

    #mh-tracker-close-button:hover {
        opacity: 1;
    }

    /* --- Controls Row (Hunts & Button) --- */
    #mh-controls-row {
        display: flex;
        align-items: stretch; /* Make items the same height */
        margin-bottom: 5px;
        margin-right: 9px;
        flex-shrink: 0;   /* Prevent controls row from shrinking */
    }

    /* ---- Hunts Count Box ---- */
    #mh-hunt-counts-row {
        background-color: #3b3b3b;
        border-radius: 5px 0 0 5px; /* Rounded left corners */
        padding: 3px 5px;
        text-align: center;
        box-sizing: border-box;
        flex-grow: 0;      /* Fixed width for Hunts box */
        flex-shrink: 0;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* ---- Start Button & Container ---- */
    #mh-start-button-container {
        flex-grow: 1;      /* Button container takes remaining space */
        flex-shrink: 0;
    }

    button#mh-tracker-start-button {
        background-color: #5a5a5a;
        color: #e0e0e0;
        border: none;
        border-radius: 0 5px 5px 0; /* Rounded right corners */
        padding: 3px 5px;
        font-size: 0.95em;
        cursor: pointer;
        text-align: center;
        box-sizing: border-box;
        user-select: none;
        width: 100%;        /* Button fills container width */
        transition: background-color 0.3s ease;
    }

    button#mh-tracker-start-button:hover {
        background-color: #666666;
    }

    button#mh-tracker-start-button:disabled {
        background-color: #2a2a2a;
        cursor: not-allowed;
    }

    /* --- Mouse List Styling --- */
    #mh-mouse-tracker-container #mh-mouse-list {
        display: flex;
        flex-direction: column;
        overflow-y: auto; /* Enable vertical scrolling when needed */
        overflow-x: hidden;
        margin-top: 5px;
        min-height: 50px;   /* Ensure a minimum height */
        flex-grow: 1;      /* Mouse list takes remaining vertical space */
        max-height: none;   /* Remove max-height restriction */

        scrollbar-width: thin;          /* Firefox scrollbar */
        scrollbar-color: #555555 #2a2a2a; /* Firefox scrollbar colors */
    }

    /* --- Mouse List Rows (Header & Data) --- */
    #mh-mouse-tracker-container #mh-mouse-list-header-row,
    #mh-mouse-tracker-container #mh-mouse-list div {
        display: flex;
        justify-content: space-between; /* Space columns evenly */
        align-items: center;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* ---- Mouse List Header Row ---- */
    #mh-mouse-tracker-container #mh-mouse-list #mh-mouse-list-header-row {
        background-color: #444;
        font-weight: bold;
        padding: 1px 6px;        /* Vertical and horizontal padding */
        flex-shrink: 0;
    }

    /* ---- Mouse List Data Rows ---- */
    #mh-mouse-tracker-container #mh-mouse-list div {
        background-color: #3d3d3d;
        padding: 10px 6px 10px 0px; /* Vertical and horizontal padding */
        margin-bottom: 0px;
        transition: background-color 0.3s ease;
    }

    #mh-mouse-tracker-container #mh-mouse-list div:nth-child(odd) {
        background-color: #333333; /* Alternating row color */
    }
    #mh-mouse-tracker-container #mh-mouse-list div:hover {
        background-color: #555555; /* Hover color */
    }
    /* Green highlight for newly caught mice - whole row */
    #mh-mouse-tracker-container #mh-mouse-list div[style*="color: lightgreen"] {
        color: lightgreen; /* Green text color */
        /* Add other row-level styling here if needed, like background-color */
    }

    /* --- Column Styles (Name & C/M) --- */
    .mh-mouse-name-col, .mh-header-name-col {
        text-align: left;
        padding-left: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .mh-cm-col, .mh-header-cm-col {
        text-align: center;      /* Center align C/M column */
        padding: 4px 0;
        padding-right: 2px;
        box-sizing: border-box;
        min-width: 0;
        white-space: nowrap;
    }

    /* --- Resizing Styles --- */
    #mh-mouse-tracker-container.resizing {
        cursor: nwse-resize; /* Diagonal resize cursor */
    }
    /* Resize handle in bottom-right corner */
    #mh-mouse-tracker-container::after {
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 10px;
        height: 10px;
        background-color: rgba(255, 255, 255, 0.1); /* Subtle handle background */
        border-right: 2px solid #666;
        border-bottom: 2px solid #666;
        cursor: nwse-resize; /* Resize cursor on handle */
        box-sizing: border-box;
    }

    /* --- Scrollbar Styling (webkit - Chrome, Safari) --- */
    #mh-mouse-tracker-container #mh-mouse-list::-webkit-scrollbar {
        width: 8px; /* Narrow scrollbar */
    }
    #mh-mouse-tracker-container #mh-mouse-list::-webkit-scrollbar-thumb {
        background-color: #555555; /* Thumb color */
        border-radius: 10px;
        transition: background-color 0.3s ease;
    }
    #mh-mouse-tracker-container #mh-mouse-list::-webkit-scrollbar-thumb:hover {
        background-color: #888888; /* Lighter thumb on hover */
    }
    #mh-mouse-tracker-container #mh-mouse-list::-webkit-scrollbar-track {
        background-color: #2a2a2a; /* Track color (match container) */
        border-radius: 10px;
    }
    #mh-mouse-tracker-container #mh-mouse-list::-webkit-scrollbar:vertical {
        opacity: 0;         /* Initially hidden */
        transition: opacity 0.3s ease-in-out;
    }
    #mh-mouse-tracker-container #mh-mouse-list:hover::-webkit-scrollbar:vertical,
    #mh-mouse-tracker-container #mh-mouse-list:active::-webkit-scrollbar:vertical {
        opacity: 1;         /* Show on hover or scroll active */
    }

    /* --- Reopen Button Styling --- */
    #mh-tracker-reopen-button {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: #444;
        color: #e0e0e0;
        border: 1px solid #666;
        border-radius: 5px;
        padding: 5px 10px;
        font-size: 0.9em;
        cursor: pointer;
        z-index: 999; /* Ensure it's below tracker but above game content */
        display: none; /* Initially hidden - will be shown when tracker is closed */
    }

    #mh-tracker-reopen-button:hover {
        background-color: #555;
    }
`);

// == JavaScript functions ==

(function() {
    'use strict';

    const MOUSE_NAME_CORRECTIONS = {
        "Ful'Mina, The Mountain Queen": "Ful'mina the Mountain Queen",
        "Inferna, The Engulfed": "Inferna the Engulfed",
        "Nachous, The Molten": "Nachous the Molten",
        "Stormsurge, the Vile Tempest": "Stormsurge the Vile Tempest",
        "Bruticus, the Blazing": "Bruticus the Blazing",
        "Vincent, The Magnificent": "Vincent The Magnificent",
        "Corky, the Collector": "Corky the Collector",
        "Ol' King Coal": "Ol King Coal"
    };

    let mouseData = [];
    let trackerState = {};
    const domElements = {}; // Use const for domElements as it's reassigned

    // --- Utility Functions ---
    const correctMouseName = (mouseName) => {
        const cleanedName = mouseName.replace(" Mouse", "");
        return MOUSE_NAME_CORRECTIONS[cleanedName] || cleanedName;
    };

    const getHuntingStatsPromise = () => {
        return new Promise((resolve, reject) => {
            hg.utils.MouseUtil.getHuntingStats(resolve, reject); // Directly use resolve and reject
        });
    };

    const formatStartTimeButtonText = (startTimeValue) => {
        if (!startTimeValue) return "Start Tracker";
        const startTime = new Date(startTimeValue);
        const monthName = startTime.toLocaleString('default', { month: 'short' });
        const day = startTime.getDate();
        const time = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return `Started: ${monthName} ${day} ${time}`;
    };

    const calculateTextWidth = (text, font = '0.9em sans-serif') => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    };

    const calculateDefaultTrackerWidth = () => {
        let longestMouseNameWidth = 0;
        mouseData.forEach(mouse => {
            longestMouseNameWidth = Math.max(longestMouseNameWidth, calculateTextWidth(mouse.name));
        });
        return longestMouseNameWidth + 40; // Add padding
    };

    // --- UI Creation Functions ---
    function createTrackerContainer() {
        const container = document.createElement('div');
        container.id = 'mh-mouse-tracker-container';
        container.style.left = GM_getValue('mhTrackerLeft', '20px');
        container.style.top = GM_getValue('mhTrackerTop', '20px');
        const savedWidth = GM_getValue('mhTrackerWidth');
        if (savedWidth) container.style.width = savedWidth;
        container.style.height = GM_getValue('mhTrackerHeight', '45px'); // Default height if not saved
        container.style.display = GM_getValue('mhTrackerOpen', true) ? 'flex' : 'none'; // Initial visibility
        return container;
    }

    function createTrackerTitle(trackerContainer) {
        const title = document.createElement('h3');
        title.textContent = `Mouse Tracker v${GM_info.script.version}`;
        title.addEventListener('mousedown', startDrag(trackerContainer)); // Use closure for drag start
        return title;
    }

    function createCloseButton(trackerContainer, reopenButton) {
        const closeButton = document.createElement('button');
        closeButton.id = 'mh-tracker-close-button';
        closeButton.textContent = '×';
        closeButton.onclick = () => closeTracker(trackerContainer, reopenButton);
        return closeButton;
    }

    function createControlsRow() {
        const controlsRow = document.createElement('div');
        controlsRow.id = 'mh-controls-row';

        const huntCountsRow = document.createElement('div');
        huntCountsRow.id = 'mh-hunt-counts-row';
        const huntsCountDisplay = document.createElement('div');
        huntsCountDisplay.id = 'mh-tracker-hunts-count';
        huntsCountDisplay.textContent = 'Hunts: 0';
        huntCountsRow.appendChild(huntsCountDisplay);

        const startButtonContainer = document.createElement('div'); // Container for button for flex-grow
        startButtonContainer.id = 'mh-start-button-container';
        const startButton = document.createElement('button');
        startButton.id = 'mh-tracker-start-button';
        startButton.textContent = 'Start Tracker';
        startButton.onclick = startTracker;
        startButton.addEventListener('mouseover', handleStartButtonHover); // Separate handlers
        startButton.addEventListener('mouseout', handleStartButtonOut);

        startButtonContainer.appendChild(startButton);
        controlsRow.appendChild(huntCountsRow);
        controlsRow.appendChild(startButtonContainer);

        domElements.huntsCountDisplay = huntsCountDisplay;
        domElements.startButton = startButton; // Cache start button
        return controlsRow;
    }

    function createMouseList() {
        const miceList = document.createElement('div');
        miceList.id = 'mh-mouse-list';
        miceList.innerHTML = `
            <div id="mh-mouse-list-header-row">
                <span class="mh-header-name-col">Mouse</span>
                <span class="mh-header-cm-col">C/M</span>
            </div>
            Tracker Reset. Click "Start Tracker" to begin.
        `; // Header row directly in innerHTML for simplicity of initial content
        return miceList;
    }

    function createReopenButton(trackerContainer) {
        const reopenButton = document.createElement('button');
        reopenButton.id = 'mh-tracker-reopen-button';
        reopenButton.textContent = 'Open Mouse Tracker';
        reopenButton.style.display = GM_getValue('mhTrackerOpen', true) ? 'none' : 'block'; // Initial visibility opposite to tracker
        reopenButton.onclick = () => reopenTracker(trackerContainer, reopenButton);
        document.body.appendChild(reopenButton); // Append reopen button to body once
        return reopenButton;
    }

    function createResizeHandle(trackerContainer) {
        trackerContainer.addEventListener('mousedown', startResize(trackerContainer));
    }


    function createUI() {
        const trackerContainer = domElements.trackerContainer = createTrackerContainer(); // Cache container
        const reopenButton = domElements.reopenButton = createReopenButton(trackerContainer); // Cache reopen button
        const title = createTrackerTitle(trackerContainer);
        const closeButton = createCloseButton(trackerContainer, reopenButton);
        title.appendChild(closeButton); // Append close button to title
        const controlsRow = createControlsRow();
        const miceList = domElements.miceList = createMouseList(); // Cache mouse list

        trackerContainer.appendChild(title);
        trackerContainer.appendChild(controlsRow);
        trackerContainer.appendChild(miceList);
        createResizeHandle(trackerContainer);

        document.body.appendChild(trackerContainer); // Append tracker container at the end of createUI
    }


    // --- UI Interaction Handlers ---
    const startDrag = (trackerContainer) => (e) => { // Closure for container
        if (e.target === domElements.trackerContainer.querySelector('#mh-tracker-close-button')) return; // Avoid drag on close button
        trackerState.isDragging = true;
        trackerState.dragOffset = { x: e.clientX - trackerContainer.offsetLeft, y: e.clientY - trackerContainer.offsetTop };
        trackerContainer.style.cursor = 'grabbing';
        trackerContainer.style.userSelect = 'none';
    };

    document.addEventListener('mousemove', (e) => { // Drag event on document for smoother dragging
        if (!trackerState.isDragging) return;
        domElements.trackerContainer.style.left = (e.clientX - trackerState.dragOffset.x) + 'px';
        domElements.trackerContainer.style.top  = (e.clientY - trackerState.dragOffset.y) + 'px';
    });

    document.addEventListener('mouseup', () => { // Drag end event on document
        if (!trackerState.isDragging) return;
        trackerState.isDragging = false;
        domElements.trackerContainer.style.cursor = 'grab';
        domElements.trackerContainer.style.userSelect = '';
        GM_setValue('mhTrackerLeft', domElements.trackerContainer.style.left);
        GM_setValue('mhTrackerTop', domElements.trackerContainer.style.top);
    });


    const startResize = (trackerContainer) => (e) => {
        const resizeHandleSize = 10;
        const containerRect = trackerContainer.getBoundingClientRect();
        if (!(e.clientX >= containerRect.right - resizeHandleSize && e.clientX <= containerRect.right &&
              e.clientY >= containerRect.bottom - resizeHandleSize && e.clientY <= containerRect.bottom)) {
            return; // Only resize if handle is clicked
        }

        trackerState.isResizing = true;
        trackerState.resizeStartX = e.clientX;
        trackerState.resizeStartY = e.clientY;
        trackerState.initialWidthResize = trackerContainer.offsetWidth;
        trackerState.initialHeightResize = trackerContainer.offsetHeight;
        trackerContainer.classList.add('resizing');
    };

    document.addEventListener('mousemove', (e) => { // Resize event on document
        if (!trackerState.isResizing) return;

        const widthDiff = e.clientX - trackerState.resizeStartX;
        const heightDiff = e.clientY - trackerState.resizeStartY;
        const newWidth = trackerState.initialWidthResize + widthDiff;
        const newHeight = trackerState.initialHeightResize + heightDiff;

        domElements.trackerContainer.style.width = `${Math.max(newWidth, 150)}px`;
        domElements.trackerContainer.style.height = `${Math.max(newHeight, 75)}px`;
    });

    document.addEventListener('mouseup', () => { // Resize end event on document
        if (!trackerState.isResizing) return;
        trackerState.isResizing = false;
        domElements.trackerContainer.classList.remove('resizing');
        GM_setValue('mhTrackerWidth', domElements.trackerContainer.style.width);
        GM_setValue('mhTrackerHeight', domElements.trackerContainer.style.height);
    });


    const handleStartButtonHover = () => {
        if (trackerState.startTime) {
            domElements.startButton.textContent = 'Reset Tracker';
            domElements.startButton.style.color = 'red';
        }
    };

    const handleStartButtonOut = () => {
        if (trackerState.startTime) {
            domElements.startButton.textContent = formatStartTimeButtonText(trackerState.startTime);
            domElements.startButton.style.color = '#888';
        }
    };

    const closeTracker = (trackerContainer, reopenButton) => {
        trackerContainer.style.display = 'none';
        reopenButton.style.display = 'block';
        GM_setValue('mhTrackerOpen', false);
    };

    const reopenTracker = (trackerContainer, reopenButton) => {
        trackerContainer.style.display = 'flex';
        reopenButton.style.display = 'none';
        GM_setValue('mhTrackerOpen', true);
    };


    // --- Data Handling and UI Update ---
    const calculateTotalHunts = () => mouseData.reduce((total, mouse) => total + mouse.catches + mouse.misses, 0);

    const updateMouseListUI = () => {
        const miceList = domElements.miceList;
        miceList.innerHTML = ''; // Clear existing list - efficient clear
        miceList.appendChild(createMouseListHeader()); // Add header

        if (!mouseData || mouseData.length === 0) {
            miceList.textContent = "Loading mouse data..."; // Set textContent directly for simple text
            return;
        }

        const sortedMouseData = sortMouseData(mouseData, trackerState.initialMouseData);

        const trackedHunts = calculateTotalHunts() - trackerState.lifetimeHuntsAtStart;
        domElements.huntsCountDisplay.textContent = `Hunts: ${trackedHunts.toLocaleString()}`;

        sortedMouseData.forEach(mouse => {
            miceList.appendChild(createMouseRow(mouse, trackerState.initialMouseData));
        });
    };

    const createMouseListHeader = () => {
        const headerRow = document.createElement('div');
        headerRow.id = 'mh-mouse-list-header-row';
        headerRow.innerHTML = `
            <span class="mh-header-name-col">Mouse</span>
            <span class="mh-header-cm-col">C/M</span>
        `; // innerHTML for simpler header content
        return headerRow;
    };


    const createMouseRow = (mouse, initialMouseData) => {
        const mouseDiv = document.createElement('div');
        const nameCol = document.createElement('span');
        nameCol.className = 'mh-mouse-name-col';
        nameCol.textContent = mouse.name;

        const cmCol = document.createElement('span');
        cmCol.className = 'mh-cm-col';
        const { sessionCatches, sessionMisses } = calculateSessionCM(mouse, initialMouseData);
        cmCol.textContent = `${sessionCatches.toLocaleString()}/${sessionMisses.toLocaleString()}`;

        mouseDiv.appendChild(nameCol);
        mouseDiv.appendChild(cmCol);
        if (isNewCatch(mouse, initialMouseData)) {
            mouseDiv.style.color = 'lightgreen';
        }
        return mouseDiv;
    };

    const calculateSessionCM = (mouse, initialMouseData) => {
        let sessionCatches = 0;
        let sessionMisses = 0;
        if (initialMouseData) {
            const sessionStartData = initialMouseData.find(initialMouse => initialMouse.name === mouse.name);
            if (sessionStartData) {
                sessionCatches = mouse.catches - sessionStartData.catches;
                sessionMisses = mouse.misses - sessionStartData.misses;
            }
        }
        return { sessionCatches, sessionMisses };
    };

    const isNewCatch = (mouse, initialMouseData) => {
        const initialMouse = initialMouseData && initialMouseData.find(initialMouse => initialMouse.name === mouse.name);
        return initialMouse && mouse.catches > initialMouse.catches;
    };


    const sortMouseData = (currentMouseData, initialMouseData) => {
        return [...currentMouseData].sort((a, b) => {
            const caughtA = isNewCatch(a, initialMouseData);
            const caughtB = isNewCatch(b, initialMouseData);
            if (caughtA && !caughtB) return -1;
            if (!caughtA && caughtB) return 1;
            return a.name.localeCompare(b.name); // Alphabetical if both/neither are new catches
        });
    };


    const updateUI = () => {
        if (!domElements.miceList) {
            console.error("UI not initialized. Call createUI() first.");
            return;
        }
        updateMouseListUI();
    };


    const fetchMouseDataAndUpdateUI = async () => {
        try {
            const data = await getHuntingStatsPromise();
            mouseData = data.map(item => ({
                name: correctMouseName(item.name),
                catches: item.num_catches,
                misses: item.num_misses,
                region: null
            }));
            updateUI();
        } catch (error) {
            console.error("Failed to fetch mouse data:", error); // More informative error log
            domElements.miceList.textContent = "Error loading mouse data.";
        }
    };


    // --- Tracker Start/Reset Logic ---
    function startTracker() {
        const hasStartedBefore = GM_getValue('mhTrackerFirstStart', false);

        if (!hasStartedBefore) {
            domElements.trackerContainer.style.height = '300px';
            GM_setValue('mhTrackerHeight', '300px');
            GM_setValue('mhTrackerFirstStart', true);
        }

        if (trackerState.startTime) {
            if (window.confirm("Are you sure you want to RESET the tracker? This will delete all tracked data.")) {
                resetTracker();
            }
        } else {
            startNewTrackingSession();
        }
    }


    const startNewTrackingSession = async () => {
        try {
            const data = await getHuntingStatsPromise();
            const currentMouseData = data.map(item => ({
                name: correctMouseName(item.name),
                catches: item.num_catches,
                misses: item.num_misses,
                region: null
            }));

            trackerState.initialMouseData = JSON.parse(JSON.stringify(currentMouseData)); // Deep copy
            trackerState.startTime = Date.now();
            trackerState.lifetimeHuntsAtStart = calculateTotalHunts();

            localStorage.setItem('mhMouseTrackerState', JSON.stringify(trackerState));

            domElements.startButton.textContent = formatStartTimeButtonText(trackerState.startTime);
            domElements.startButton.style.color = '#888';
            updateUI();
        } catch (error) {
            console.error("Error starting tracker:", error); // More specific error message
            alert("Failed to start tracker. Please check console for errors."); // User feedback on failure
        }
    };


    function resetTracker() {
        trackerState = {};
        localStorage.removeItem('mhMouseTrackerState');

        domElements.startButton.textContent = 'Start Tracker';
        domElements.startButton.style.color = '';
        domElements.miceList.innerHTML = `
            <div id="mh-mouse-list-header-row">
                <span class="mh-header-name-col">Mouse</span>
                <span class="mh-header-cm-col">C/M</span>
            </div>
            Tracker Reset. Click "Start Tracker" to begin.
        `; // Re-set initial text with header
        domElements.huntsCountDisplay.textContent = 'Hunts: 0';
    }


    // --- Initialization ---
    function initializeTracker() {
        createUI();
        fetchMouseDataAndUpdateUI(); // Initial fetch and UI population

        const storedTrackerState = localStorage.getItem('mhMouseTrackerState');
        if (storedTrackerState) {
            trackerState = JSON.parse(storedTrackerState);
            if (trackerState.startTime) {
                domElements.startButton.textContent = formatStartTimeButtonText(trackerState.startTime);
                domElements.startButton.style.color = '#888';
            }
        }
        updateUI(); // Ensure UI reflects loaded state or defaults
    }


    initializeTracker();

})();

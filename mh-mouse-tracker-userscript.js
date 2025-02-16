// ==UserScript==
// @name         MouseHunt Mouse Tracker
// @namespace    http://tampermonkey.net/
// @version      0.6.8
// @description  Tracks mice caught in MouseHunt
// @author       You
// @match        https://www.mousehuntgame.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mousehuntgame.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @license      MIT
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
        padding: 1px 6px 1px 0px;        /* Vertical and horizontal padding */
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
    #mh-mouse-tracker-container #mh-mouse-list div[style*="color: green"] {
        color: green; /* Green text color */
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
`);

// == JavaScript functions ==

(function() {
    'use strict';

    let mouseData = [];
    let trackerState = {};
    let domElements = {};

    function correctMouseName(mouseName) {
        mouseName = mouseName.replace(" Mouse", "");
        let newMouseName = mouseName;
        if (mouseName === "Ful'Mina, The Mountain Queen") {
            newMouseName = "Ful'mina the Mountain Queen";
        } else if (mouseName === "Inferna, The Engulfed") {
            newMouseName = "Inferna the Engulfed";
        } else if (mouseName === "Nachous, The Molten") {
            newMouseName = "Nachous the Molten";
        } else if (mouseName === "Stormsurge, the Vile Tempest") {
            newMouseName = "Stormsurge the Vile Tempest";
        } else if (mouseName === "Bruticus, the Blazing") {
            newMouseName = "Bruticus the Blazing";
        } else if (mouseName === "Vincent, The Magnificent") {
            newMouseName = "Vincent The Magnificent";
        } else if (mouseName === "Corky, the Collector") {
            newMouseName = "Corky the Collector";
        } else if (mouseName === "Ol' King Coal") {
            newMouseName = "Ol King Coal";
        }
        return newMouseName;
    }

    function getMouseDataFromAPI() {
        hg.utils.MouseUtil.getHuntingStats(function(data) {
            mouseData = [];
            data.forEach(function(arrayItem) {
                const mouseName = correctMouseName(arrayItem.name);
                mouseData.push({
                    name: mouseName,
                    catches: arrayItem.num_catches,
                    misses: arrayItem.num_misses,
                    region: null
                });
            });
            updateUI();
        });
    }

    function formatStartTimeButtonText(startTimeValue) {
        if (!startTimeValue) {
            return "Start Tracker";
        }
        const startTime = new Date(startTimeValue);
        const monthName = startTime.toLocaleString('default', { month: 'short' });
        const day = startTime.getDate();
        const time = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // 24hr format
        return `Started: ${monthName} ${day} ${time}`;
    }

    function calculateDefaultTrackerWidth() {
        let longestMouseNameWidth = 0;
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.fontSize = '0.9em';
        document.body.appendChild(tempSpan);

        mouseData.forEach(mouse => {
            tempSpan.textContent = mouse.name;
            longestMouseNameWidth = Math.max(longestMouseNameWidth, tempSpan.offsetWidth);
        });

        document.body.removeChild(tempSpan);
        return longestMouseNameWidth + 40; // Add padding
    }

    function calculateInitialContentHeight(trackerContainer, title, controlsRow, miceList) {
        trackerContainer.appendChild(title);
        trackerContainer.appendChild(controlsRow);
        trackerContainer.appendChild(miceList);

        const contentHeight = trackerContainer.offsetHeight;

        trackerContainer.removeChild(title);
        trackerContainer.removeChild(controlsRow);
        trackerContainer.removeChild(miceList);

        return contentHeight;
    }


    function createUI() {
        const trackerContainer = document.createElement('div');
        trackerContainer.id = 'mh-mouse-tracker-container';

        let savedLeft = GM_getValue('mhTrackerLeft', '20px');
        let savedTop = GM_getValue('mhTrackerTop', '20px');
        let savedWidth = GM_getValue('mhTrackerWidth');
        let savedHeight = GM_getValue('mhTrackerHeight');

        trackerContainer.style.left = savedLeft;
        trackerContainer.style.top = savedTop;
        if (savedWidth) {
            trackerContainer.style.width = savedWidth;
        }
        trackerContainer.style.height = '45px';

        if (savedHeight) {
            trackerContainer.style.height = savedHeight;
        }


        let dragOffset = { x: 0, y: 0 };
        let isDragging = false;

        const title = document.createElement('h3');
        const scriptVersion = GM_info.script.version;
        title.textContent = 'Mouse Tracker v' + scriptVersion;
        trackerContainer.appendChild(title);

        title.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX - trackerContainer.offsetLeft;
            dragOffset.y = e.clientY - trackerContainer.offsetTop;
            title.style.cursor = 'grabbing';
            title.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            trackerContainer.style.left = (e.clientX - dragOffset.x) + 'px';
            trackerContainer.style.top  = (e.clientY - dragOffset.y) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            title.style.cursor = 'grab';
            title.style.userSelect = '';
            GM_setValue('mhTrackerLeft', trackerContainer.style.left);
            GM_setValue('mhTrackerTop', trackerContainer.style.top);
        });

        const controlsRow = document.createElement('div');
        controlsRow.id = 'mh-controls-row';

        const huntCountsRow = document.createElement('div');
        huntCountsRow.id = 'mh-hunt-counts-row';

        const huntsCountDisplay = document.createElement('div');
        huntsCountDisplay.id = 'mh-tracker-hunts-count';
        huntsCountDisplay.textContent = 'Hunts: 0';
        huntCountsRow.appendChild(huntsCountDisplay);
        domElements.huntsCountDisplay = huntsCountDisplay;
        controlsRow.appendChild(huntCountsRow);

        const startButton = document.createElement('button');
        startButton.id = 'mh-tracker-start-button';
        startButton.textContent = 'Start Tracker';
        startButton.onclick = startTracker;

        startButton.addEventListener('mouseover', () => {
            if (trackerState.startTime) {
                startButton.textContent = 'Reset Tracker';
                startButton.style.color = 'red';
            }
        });

        startButton.addEventListener('mouseout', () => {
            if (trackerState.startTime) {
                startButton.textContent = formatStartTimeButtonText(trackerState.startTime);
                startButton.style.color = '#888';
            }
        });

        controlsRow.appendChild(startButton);
        trackerContainer.appendChild(controlsRow);
        domElements.startButton = startButton;

        const miceList = document.createElement('div');
        miceList.id = 'mh-mouse-list';

        const headerRow = document.createElement('div');
        headerRow.id = 'mh-mouse-list-header-row';

        const headerNameCol = document.createElement('span');
        headerNameCol.className = 'mh-header-name-col';
        headerNameCol.textContent = 'Mouse';

        const headerCMCol = document.createElement('span');
        headerCMCol.className = 'mh-header-cm-col';
        headerCMCol.textContent = 'C/M';

        headerRow.appendChild(headerNameCol);
        headerRow.appendChild(headerCMCol);

        miceList.appendChild(headerRow);
        miceList.textContent = 'Tracker Reset. Click "Start Tracker" to begin.';

        calculateInitialContentHeight(trackerContainer, title, controlsRow, miceList);

        if (savedHeight) {
            trackerContainer.style.height = savedHeight;
        } else {
            trackerContainer.style.height = '45px';
        }

        trackerContainer.appendChild(title);
        trackerContainer.appendChild(controlsRow);
        trackerContainer.appendChild(miceList);

        domElements.startButton = startButton;
        domElements.miceList = miceList;
        domElements.title = title;
        domElements.controlsRow = controlsRow;

        title.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX - trackerContainer.offsetLeft;
            dragOffset.y = e.clientY - trackerContainer.offsetTop;
            title.style.cursor = 'grabbing';
            title.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            trackerContainer.style.left = (e.clientX - dragOffset.x) + 'px';
            trackerContainer.style.top  = (e.clientY - dragOffset.y) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            title.style.cursor = 'grab';
            title.style.userSelect = '';
            GM_setValue('mhTrackerLeft', trackerContainer.style.left);
            GM_setValue('mhTrackerTop', trackerContainer.style.top);
        });

        let isResizing = false;
        let resizeStartX, resizeStartY;
        let initialWidthResize, initialHeightResize;

        trackerContainer.addEventListener('mousedown', (e) => {
            const containerRect = trackerContainer.getBoundingClientRect();
            const resizeHandleSize = 10;

            if (e.clientX >= containerRect.right - resizeHandleSize && e.clientX <= containerRect.right &&
                e.clientY >= containerRect.bottom - resizeHandleSize && e.clientY <= containerRect.bottom) {
                isResizing = true;
                resizeStartX = e.clientX;
                resizeStartY = e.clientY;
                initialWidthResize = trackerContainer.offsetWidth;
                initialHeightResize = trackerContainer.offsetHeight;
                trackerContainer.classList.add('resizing');
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const widthDiff = e.clientX - resizeStartX;
            const heightDiff = e.clientY - resizeStartY;

            const newWidth = initialWidthResize + widthDiff;
            const newHeight = initialHeightResize + heightDiff;

            trackerContainer.style.width = `${Math.max(newWidth, 150)}px`;
            trackerContainer.style.height = `${Math.max(newHeight, 75)}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                trackerContainer.classList.remove('resizing');
                GM_setValue('mhTrackerWidth', trackerContainer.style.width);
                GM_setValue('mhTrackerHeight', trackerContainer.style.height);
            }
        });

        document.body.appendChild(trackerContainer);
        domElements.trackerContainer = trackerContainer;
    }


    function calculateTotalHunts() {
        let totalHunts = 0;
        for (const mouse of mouseData) {
            totalHunts += mouse.catches + mouse.misses;
        }
        return totalHunts;
    }

    function updateUI() {
        if (!domElements.miceList) {
            console.error("UI not initialized. Call createUI() first.");
            return;
        }

        domElements.miceList.innerHTML = '';

        if (!mouseData || mouseData.length === 0) {
            domElements.miceList.textContent = "Loading mouse data...";
            return;
        }

        const headerRow = document.createElement('div');
        headerRow.id = 'mh-mouse-list-header-row';

        const headerNameCol = document.createElement('span');
        headerNameCol.className = 'mh-header-name-col';
        headerNameCol.textContent = 'Mouse';

        const headerCMCol = document.createElement('span');
        headerCMCol.className = 'mh-header-cm-col';
        headerCMCol.textContent = 'C/M';

        headerRow.appendChild(headerNameCol);
        headerRow.appendChild(headerCMCol);

        domElements.miceList.appendChild(headerRow);

        const sortedMouseData = [...mouseData].sort((a, b) => {
            const initialDataA = trackerState.initialMouseData.find(initialMouse => initialMouse.name === a.name);
            const initialDataB = trackerState.initialMouseData.find(initialMouse => initialMouse.name === b.name);

            const caughtA = initialDataA && a.catches > initialDataA.catches;
            const caughtB = initialDataB && b.catches > initialDataB.catches;

            if (caughtA && !caughtB) {
                return -1;
            } else if (!caughtA && caughtB) {
                return 1;
            } else {
                return a.name.localeCompare(b.name);
            }
        });

        const trackedHunts = calculateTotalHunts() - trackerState.lifetimeHuntsAtStart;
        domElements.huntsCountDisplay.textContent = `Hunts: ${trackedHunts.toLocaleString()}`;

        sortedMouseData.forEach(mouse => {
            const mouseDiv = document.createElement('div');
            const nameCol = document.createElement('span');
            nameCol.className = 'mh-mouse-name-col';
            nameCol.textContent = mouse.name;

            const cmCol = document.createElement('span');
            cmCol.className = 'mh-cm-col';
            let sessionCatches = 0;
            let sessionMisses = 0;
            if (trackerState.initialMouseData) {
                const sessionStartData = trackerState.initialMouseData.find(initialMouse => initialMouse.name === mouse.name);
                if (sessionStartData) {
                    sessionCatches = mouse.catches - sessionStartData.catches;
                    sessionMisses = mouse.misses - sessionStartData.misses;
                }
            }
            cmCol.textContent = `${sessionCatches.toLocaleString()}/${sessionMisses.toLocaleString()}`;

            mouseDiv.appendChild(nameCol);
            mouseDiv.appendChild(cmCol);

            const initialMouse = trackerState.initialMouseData.find(initialMouse => initialMouse.name === mouse.name);

            if (initialMouse && mouse.catches > initialMouse.catches) {
                mouseDiv.style.color = 'lightgreen';
            }
            domElements.miceList.appendChild(mouseDiv);
        });
    }

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
            getMouseDataFromAPI();
            hg.utils.MouseUtil.getHuntingStats(function(data) {
                const currentMouseData = [];
                data.forEach(function(arrayItem) {
                    const mouseName = correctMouseName(arrayItem.name);
                    currentMouseData.push({
                        name: mouseName,
                        catches: arrayItem.num_catches,
                        misses: arrayItem.num_misses,
                        region: null
                    });
                });
                trackerState.initialMouseData = JSON.parse(JSON.stringify(currentMouseData));
                trackerState.startTime = Date.now();
                trackerState.lifetimeHuntsAtStart = calculateTotalHunts();

                localStorage.setItem('mhMouseTrackerState', JSON.stringify(trackerState));

                domElements.startButton.textContent = formatStartTimeButtonText(trackerState.startTime);
                domElements.startButton.style.color = '#888';
                updateUI();
            });
        }
    }

    function resetTracker() {
        trackerState = {};
        localStorage.removeItem('mhMouseTrackerState');

        domElements.startButton.textContent = 'Start Tracker';
        domElements.startButton.style.color = '';
        domElements.miceList.innerHTML = 'Tracker Reset. Click "Start Tracker" to begin.';
        domElements.huntsCountDisplay.textContent = 'Hunts: 0';

        const initialContentHeight = calculateInitialContentHeight(domElements.trackerContainer, domElements.title, domElements.controlsRow, domElements.miceList);
        domElements.trackerContainer.style.height = `${initialContentHeight}px`;
    }

    function initializeTracker() {
        createUI();
        getMouseDataFromAPI();

        const storedTrackerState = localStorage.getItem('mhMouseTrackerState');
        if (storedTrackerState) {
            trackerState = JSON.parse(storedTrackerState);
            if (trackerState.startTime) {
                domElements.startButton.textContent = formatStartTimeButtonText(trackerState.startTime);
                domElements.startButton.style.color = '#888';
                domElements.huntsCountDisplay.textContent = 'Hunts: 0';
            }
        }
        updateUI();
    }

    initializeTracker();

})();

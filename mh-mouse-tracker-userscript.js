// ==UserScript==
// @name         MouseHunt Mouse Tracker
// @namespace    http://tampermonkey.net/
// @version      0.8.34
// @description  Tracks mice caught in MouseHunt (Two-Tiered Grouping: Region > Location + API Region Data + Bug Fix + SemVer Patch + Scroll Fix)
// @author       You
// @match        https://www.mousehuntgame.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mousehuntgame.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @license      GPLv3
// ==/UserScript==

// == CSS for Dark Mode ==
GM_addStyle(`
  #mh-mouse-tracker-container_v2 {position: absolute; top: 20px; left: 20px; z-index: 1000; display: flex; flex-direction: column; overflow: hidden; background-color: #2a2a2a; color: #e0e0e0; border: 1px solid #444444; border-radius: 5px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.6); cursor: default; padding: 10px 10px 10px 10px; max-height: 95vh; min-height: 75px; font-size: math;}
  #mh-mouse-tracker-container_v2 h3 {cursor: grab; margin: 0 0 10px 0; font-size: 1.2em; font-weight: bold; color: #f1f1f1; user-select: none; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center;}
  /**/
  #mh-tracker-close-button_v2 {background: none; color: #e0e0e0; border: none; font-size: 1em; cursor: pointer; opacity: 0.6; transition: opacity 0.3s ease; margin-left: 10px; position: relative; top: -3px;}
  #mh-tracker-close-button_v2:hover {opacity: 1;}
  /**/
  #mh-controls-row_v2 {display: flex; align-items: stretch; margin-bottom: 5px; margin-right: 9px; flex-shrink: 0;}
  #mh-hunt-counts-row_v2 {background-color: #3b3b3b; border-radius: 5px 0 0 5px; padding: 3px 5px; text-align: center; box-sizing: border-box; flex-grow: 0; flex-shrink: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
  /**/
  #mh-start-button-container_v2 {flex-grow: 1; flex-shrink: 0;}
  /**/
  button#mh-tracker-start-button_v2 {background-color: #5a5a5a; color: #e0e0e0; border: none; border-radius: 0 5px 5px 0; padding: 3px 5px; font-size: 0.95em; cursor: pointer; text-align: center; box-sizing: border-box; user-select: none; width: 100%; transition: background-color 0.3s ease;}
  button#mh-tracker-start-button_v2:hover {background-color: #666666;}
  button#mh-tracker-start-button_v2:disabled {background-color: #2a2a2a; cursor: not-allowed;}
  /**/
  #mh-mouse-list_v2 {display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; margin-top: 5px; min-height: 50px; flex-grow: 1; max-height: 95vh; scrollbar-width: thin; scrollbar-color: #555555 #2a2a2a; height: 100%;} /* Added height: auto; */
  #mh-mouse-list-header-row_v2 {display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
  #mh-mouse-list_v2 div {display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; white-space: nowrap; overflow-y: hidden; text-overflow: ellipsis;}
  #mh-mouse-list_v2 #mh-mouse-list-header-row_v2 {background-color: #444; font-weight: bold; padding: 0px 6px; margin: 0;} /* Padding and margin removed */
  #mh-mouse-list_v2 div {background-color: #3d3d3d; margin-bottom: 0px; transition: background-color 0.3s ease;} /* Reduced padding */
  #mh-mouse-list_v2 div:nth-child(odd) {background-color: #333333;}
  #mh-mouse-list_v2 div:hover {background-color: #555555;}
  #mh-mouse-list_v2 div[style*="color: lightgreen"] {color: lightgreen;}
  /**/
  .mh-mouse-name-col_v2 {text-align: left; padding: 0px 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-height: 25px;}
  .mh-header-name-col_v2 {text-align: left; padding: 0px 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-height: 25px;}
  .mh-cm-col_v2, .mh-header-cm-col_v2 {text-align: center; padding: 4px 0; padding-right: 2px; box-sizing: border-box; min-width: 0; white-space: nowrap;}
  /**/
  #mh-mouse-tracker-container_v2.resizing {cursor: nwse-resize;}
  #mh-mouse-tracker-container_v2::after {content: ''; position: absolute; right: 0; bottom: 0; width: 10px; height: 10px; background-color: rgba(255, 255, 255, 0.1); border-right: 2px solid #666; border-bottom: 2px solid #666; cursor: nwse-resize; box-sizing: border-box;}
  #mh-mouse-tracker-container_v2 #mh-mouse-list_v2::-webkit-scrollbar {width: 8px;}
  #mh-mouse-tracker-container_v2 #mh-mouse-list_v2::-webkit-scrollbar-thumb {background-color: #555555; border-radius: 10px; transition: background-color 0.3s ease;}
  #mh-mouse-tracker-container_v2 #mh-mouse-list_v2::-webkit-scrollbar-thumb:hover {background-color: #888888;}
  #mh-mouse-tracker-container_v2 #mh-mouse-list_v2::-webkit-scrollbar-track {background-color: #705252; border-radius: 10px;}
  #mh-mouse-tracker-container_v2 #mh-mouse-list_v2::-webkit-scrollbar:vertical {opacity: 0; transition: opacity 0.3s ease-in-out;}
  #mh-mouse-tracker-container_v2 #mh-mouse-list_v2:hover::-webkit-scrollbar:vertical, #mh-mouse-tracker-container_v2 #mh-mouse-list_v2:active::-webkit-scrollbar:vertical {opacity: 1;}
  /**/
  #mh-tracker-reopen-button_v2 {position: absolute; top: 10px; left: 10px; background-color: #444; color: #e0e0e0; border: 1px solid #666; border-radius: 5px; padding: 5px 10px; font-size: 0.9em; cursor: pointer; z-index: 999; display: none;}
  #mh-tracker-reopen-button_v2:hover {background-color: #555;}
  .mh-group-header-row_v2 {background-color: #fcfcfc; color: #f0f0f0; font-weight: bold; padding: 5px 6px; min-height: 25px; margin-bottom: 0px; border-radius: 3px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;} /* Reduced padding and margin */
  .mh-group-header-row_v2:hover {background-color: #666;}
  .mh-group-title_v2 {flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
  .mh-group-collapse-icon_v2 {width: 14px; height: 14px; text-align: center; line-height: 14px; margin-left: 10px; font-size: 1em; opacity: 0.7; transition: opacity 0.3s ease;}
  .mh-group-header-row_v2:hover .mh-group-collapse-icon_v2 {opacity: 1;}
  .mh-group-mice-container_v2 {padding: 0px; margin-left: 0px; overflow-y:scroll;/*height: auto;*/ } /* Removed fixed height from group containers, removed margin */
  .mh-location-header-row_v2 {background-color: #4a4a4a; color: #e8e8e8; font-weight: bold; padding: 3px 6px; margin-top: 0px; margin-bottom: 0px; border-radius: 3px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;} /* Reduced padding and margin */
  .mh-location-header-row_v2:hover {background-color: #5a5a5a;}
  .mh-location-title_v2 {flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.95em;}
  .mh-location-collapse-icon_v2 {width: 12px; height: 12px; text-align: center; line-height: 12px; margin-left: 8px; font-size: 0.9em; opacity: 0.6; transition: opacity 0.3s ease;}
  .mh-location-header-row_v2:hover .mh-location-collapse-icon_v2 {opacity: 1;}
  .mh-location-mice-container_v2 {padding: 0px; margin-left: 0px; overflow-y: scroll; min-height: 100px; }
  #mh-mouse-list_v2 div{overflow-y: auto;}
`);

// == JavaScript functions ==

(function() {
  'use strict';

  const mouseNameCorrections = {
    "Ful'Mina, The Mountain Queen": "Ful'mina the Mountain Queen",
    "Inferna, The Engulfed": "Inferna the Engulfed",
    "Nachous, The Molten": "Nachous the Molten",
    "Stormsurge, the Vile Tempest": "Stormsurge the Vile Tempest",
    "Bruticus, the Blazing": "Bruticus the Blazing",
    "Vincent, The Magnificent": "Vincent The Magnificent",
    "Corky, the Collector": "Corky the Collector",
    "Ol' King Coal": "Ol King Coal"
  };

  let md = [];
  let ts = {};
  const dom = {};
  let environments = []; // Store environments data here

  // --- Utility Functions ---
  const correctMouseName = (mouseName) => {
    const cleanedName = mouseName.replace(" Mouse", "");
    return mouseNameCorrections[cleanedName] || cleanedName;
  };

  const getHuntingStatsPromise = () => {
    return new Promise((resolve, reject) => {
      hg.utils.MouseUtil.getHuntingStats(resolve, reject);
    });
  };

  const fetchEnvironmentsData = async () => {
    try {
      const response = await fetch('https://api.mouse.rip/environments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      environments = await response.json(); // Store fetched environments data
      return environments;
    } catch (error) {
      console.error("Error fetching environments:", error);
      dom.miceLst.textContent = "Error loading environment data.";
      return null;
    }
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
    md.forEach(mouse => {
      longestMouseNameWidth = Math.max(longestMouseNameWidth, calculateTextWidth(mouse.name));
    });
    return longestMouseNameWidth + 40;
  };

  // --- UI Creation Functions ---
  function createTrackerContainer() {
    const cont = document.createElement('div');
    cont.id = 'mh-mouse-tracker-container_v2';
    cont.style.left = GM_getValue('mhTrackerLeft_v2', '20px');
    cont.style.top = GM_getValue('mhTrackerTop_v2', '20px');
    const savedWidth = GM_getValue('mhTrackerWidth_v2');
    if (savedWidth) cont.style.width = savedWidth;
    cont.style.height = GM_getValue('mhTrackerHeight_v2', '45px');
    cont.style.display = GM_getValue('mhTrackerOpen_v2', true) ? 'flex' : 'none';
    return cont;
  }

  function createTrackerTitle(trackerCont) {
    const titleElement = document.createElement('h3');
    if (!titleElement) {
      console.error("Error: document.createElement('h3') failed for title!");
      return null;
    }
    titleElement.textContent = `Mouse Tracker v${GM_info.script.version}`;
    titleElement.addEventListener('mousedown', startDrag(trackerCont));
    return titleElement;
  }

  function createCloseButton(trackerCont, reopenBtn) {
    const closeBtn = document.createElement('button');
    closeBtn.id = 'mh-tracker-close-button_v2';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => closeTracker(trackerCont, reopenBtn);
    return closeBtn;
  }

  function createControlsRow() {
    const ctrlRow = document.createElement('div');
    ctrlRow.id = 'mh-controls-row_v2';

    const huntsRow = document.createElement('div');
    huntsRow.id = 'mh-hunt-counts-row_v2';
    const huntsDisplay = document.createElement('div');
    huntsDisplay.id = 'mh-tracker-hunts-count_v2';
    huntsDisplay.textContent = 'Hunts: 0';
    huntsRow.appendChild(huntsDisplay);

    const startBtnCont = document.createElement('div');
    startBtnCont.id = 'mh-start-button-container_v2';
    const startBtn = document.createElement('button');
    startBtn.id = 'mh-tracker-start-button_v2';
    startBtn.textContent = 'Start Tracker';
    startBtn.onclick = startTracker;
    startBtn.addEventListener('mouseover', handleStartButtonHover);
    startBtn.addEventListener('mouseout', handleStartButtonOut);

    startBtnCont.appendChild(startBtn);
    ctrlRow.appendChild(huntsRow);
    ctrlRow.appendChild(startBtnCont);

    dom.huntsCountDisplay = huntsDisplay;
    dom.startBtn = startBtn;
    return ctrlRow;
  }

  function createMouseList() {
    const miceLst = document.createElement('div');
    miceLst.id = 'mh-mouse-list_v2';
    miceLst.innerHTML = `
      <div id="mh-mouse-list-header-row_v2">
        <span class="mh-header-name-col_v2">Mouse</span>
        <span class="mh-header-cm-col_v2">C/M</span>
      </div>
      Tracker Reset. Click "Start Tracker" to begin.
    `;
    return miceLst;
  }

  function createReopenButton(trackerCont) {
    const reopenBtn = document.createElement('button');
    reopenBtn.id = 'mh-tracker-reopen-button_v2';
    reopenBtn.textContent = 'Open Mouse Tracker';
    reopenBtn.style.display = GM_getValue('mhTrackerOpen_v2', true) ? 'none' : 'block';
    reopenBtn.onclick = () => reopenTracker(trackerCont, reopenBtn);
    document.body.appendChild(reopenBtn);
    return reopenBtn;
  }

  function createResizeHandle(trackerCont) {
    trackerCont.addEventListener('mousedown', startResize(trackerCont));
  }

  function createUI() {
    const trackerCont = dom.trackerCont = createTrackerContainer();
    const reopenBtn = dom.reopenBtn = createReopenButton(trackerCont);
    const title = dom.titleElement = createTrackerTitle(trackerCont); // Assign to dom.titleElement
    if (!title) return;
    const closeBtn = createCloseButton(trackerCont, reopenBtn);
    title.appendChild(closeBtn);

    const ctrlRow = dom.ctrlRow = createControlsRow();
    const miceLst = dom.miceLst = createMouseList();

    trackerCont.appendChild(title);
    trackerCont.appendChild(ctrlRow);
    trackerCont.appendChild(miceLst);
    createResizeHandle(trackerCont);

    document.body.appendChild(trackerCont);
  }

  // --- UI Interaction Handlers ---
  const startDrag = (trackerCont) => (e) => {
    if (e.target === dom.trackerCont.querySelector('#mh-tracker-close-button_v2')) return;
    ts.isDragging = true;
    ts.dragOffset = { x: e.clientX - trackerCont.offsetLeft, y: e.clientY - trackerCont.offsetTop };
    trackerCont.style.cursor = 'grabbing';
    trackerCont.style.userSelect = 'none';
  };

  document.addEventListener('mousemove', (e) => {
    if (!ts.isDragging) return;
    dom.trackerCont.style.left = (e.clientX - ts.dragOffset.x) + 'px';
    dom.trackerCont.style.top  = (e.clientY - ts.dragOffset.y) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!ts.isDragging) return;
    ts.isDragging = false;
    dom.trackerCont.style.cursor = 'grab';
    dom.trackerCont.style.userSelect = '';
    GM_setValue('mhTrackerLeft_v2', dom.trackerCont.style.left);
    GM_setValue('mhTrackerTop_v2', dom.trackerCont.style.top);
  });

  const startResize = (trackerCont) => (e) => {
    const resizeHandleSize = 10;
    const containerRect = trackerCont.getBoundingClientRect();
    if (!(e.clientX >= containerRect.right - resizeHandleSize && e.clientX <= containerRect.right &&
          e.clientY >= containerRect.bottom - resizeHandleSize && e.clientY <= containerRect.bottom)) {
      return;
    }

    ts.isResizing = true;
    ts.resizeStartX = e.clientX;
    ts.resizeStartY = e.clientY;
    ts.initialWidthResize = trackerCont.offsetWidth;
    ts.initialHeightResize = trackerCont.offsetHeight;
    trackerCont.classList.add('resizing');
  };

  document.addEventListener('mousemove', (e) => {
    if (!ts.isResizing) return;

    const widthDiff = e.clientX - ts.resizeStartX;
    const heightDiff = e.clientY - ts.resizeStartY;
    const newWidth = ts.initialWidthResize + widthDiff;
    const newHeight = ts.initialHeightResize + heightDiff;

    dom.trackerCont.style.width = `${Math.max(newWidth, 150)}px`;
    dom.trackerCont.style.height = `${Math.max(newHeight, 75)}px`;
  });

  document.addEventListener('mouseup', () => {
    if (!ts.isResizing) return;
    ts.isResizing = false;
    dom.trackerCont.classList.remove('resizing');
    GM_setValue('mhTrackerWidth_v2', dom.trackerCont.style.width);
    GM_setValue('mhTrackerHeight_v2', dom.trackerCont.style.height);
  });

  const handleStartButtonHover = () => {
    if (ts.startTime) {
      dom.startBtn.textContent = 'Reset Tracker';
      dom.startBtn.style.color = 'red';
    }
  };

  const handleStartButtonOut = () => {
    if (ts.startTime) {
      dom.startBtn.textContent = formatStartTimeButtonText(ts.startTime);
      dom.startBtn.style.color = '#888';
    }
  };

  const closeTracker = (trackerCont, reopenBtn) => {
    trackerCont.style.display = 'none';
    reopenBtn.style.display = 'block';
    GM_setValue('mhTrackerOpen_v2', false);
  };

  const reopenTracker = (trackerCont, reopenBtn) => {
    trackerCont.style.display = 'flex';
    reopenBtn.style.display = 'none';
    GM_setValue('mhTrackerOpen_v2', true);
  };

  // --- Data Handling and UI Update ---
  const calculateTotalHunts = () => md.reduce((total, mouse) => total + mouse.catches + mouse.misses, 0);

  const groupMouseData = (miceData, currentEnvId) => {
    const regionGroups = {}; // First level: Region
    let currentRegionGroup = null;

    miceData.forEach(mouse => {
      const regionName = mouse.region;
      const locationName = mouse.environmentName;

		if (!regionGroups[regionName]) {
			regionGroups[regionName] = { locations: {}, isCollapsed: GM_getValue('mhTracker_regionCollapse_' + regionName, false) }; // Initialize region group, load saved state
		}
		if (!regionGroups[regionName].locations[locationName]) {
			regionGroups[regionName].locations[locationName] = { mice: [], isCollapsed: GM_getValue('mhTracker_locationCollapse_' + locationName, false) }; // Initialize location group, load saved state
		}
      regionGroups[regionName].locations[locationName].mice.push(mouse); // Add mouse to location group
    });

    // Convert regionGroups object to array for UI rendering
    const regionGroupArray = [];
    for (const regionName in regionGroups) {
      const regionData = regionGroups[regionName];
      const locationGroupArray = [];
      for (const locationName in regionData.locations) {
        const locationData = regionData.locations[locationName];
        locationGroupArray.push({
          groupName: locationName, // Location name as group name
          mice: locationData.mice,
          isCollapsed: locationData.isCollapsed
        });
      }
      regionGroupArray.push({
        groupName: regionName,     // Region name as group name
        locations: locationGroupArray, // Array of location groups
        isCollapsed: regionData.isCollapsed
      });
    }

    // Prioritize current region and location (if currentEnvId is available)
    if (currentEnvId) {
      const currentEnv = environments.find(env => env.id === currentEnvId);
      const currentRegion = currentEnv?.region || "Unknown Region"; // Get current region from env ID
      const currentLocationName = currentEnv?.name;

      const currentRegionIndex = regionGroupArray.findIndex(group => group.groupName === currentRegion);
      if (currentRegionIndex > -1) {
        currentRegionGroup = regionGroupArray.splice(currentRegionIndex, 1)[0]; // Remove current region and get it
        regionGroupArray.unshift(currentRegionGroup); // Add current region to the front
      }

      if (currentRegionGroup && currentLocationName) { // Check if currentRegionGroup and currentLocationName are valid
          const currentLocationGroupIndex = currentRegionGroup.locations.findIndex(locGroup => locGroup.groupName === currentLocationName);
          if (currentLocationGroupIndex > -1) {
              const currentLocationGroup = currentRegionGroup.locations.splice(currentLocationGroupIndex, 1)[0];
              currentRegionGroup.locations.unshift(currentLocationGroup); // Add current location to the front of its region
          }
      }
    }

    return regionGroupArray;
  };


  const updateMouseListUI = () => {
    const miceLst = dom.miceLst;
    miceLst.innerHTML = '';

    if (!md || md.length === 0) {
      miceLst.textContent = "Loading mouse data...";
      return;
    }

    const currentEnvId = user.environment_type;
    const groupedMouseData = groupMouseData(md, currentEnvId); // Group by region, then location
    const trackedHunts = calculateTotalHunts() - ts.lifetimeHuntsAtStart;
    dom.huntsCountDisplay.textContent = `Hunts: ${trackedHunts.toLocaleString()}`;

    groupedMouseData.forEach(regionGroup => {
      const regionHeaderRow = createGroupHeaderRow(regionGroup); // Reuse group header for regions
      const regionMiceContainer = createRegionMiceContainer(regionGroup); // New region container

      miceLst.appendChild(regionHeaderRow);
      miceLst.appendChild(regionMiceContainer);
    });
  };

  const createRegionMiceContainer = (regionGroup) => { // New function for region container
    const regionMiceCont = document.createElement('div');
    regionMiceCont.className = 'mh-group-mice-container_v2'; // Use existing class for consistent styling
    regionMiceCont.style.display = regionGroup.isCollapsed ? 'none' : 'block';
    //regionMiceCont.style.height = 'auto'; // Ensure dynamic height

    regionGroup.locations.forEach(locationGroup => { // Iterate over locations in the region
      const locationHeaderRow = createLocationHeaderRow(locationGroup); // New location header
      const locationMiceContainer = createLocationMiceContainer(locationGroup); // New location container

      regionMiceCont.appendChild(locationHeaderRow);
      regionMiceCont.appendChild(locationMiceContainer);
    });
    return regionMiceCont;
  };


  const createGroupHeaderRow = (group) => { // Reused for region headers
    const headerRow = document.createElement('div');
    headerRow.className = 'mh-group-header-row_v2';
    headerRow.onclick = () => toggleRegionCollapse(group); // Call toggleRegionCollapse for region headers

    const titleSpan = document.createElement('span');
    titleSpan.className = 'mh-group-title_v2';
    titleSpan.textContent = group.groupName; // Region Name

    const collapseIconSpan = document.createElement('span');
    collapseIconSpan.className = 'mh-group-collapse-icon_v2';
    collapseIconSpan.textContent = group.isCollapsed ? '+' : '-';

    headerRow.appendChild(titleSpan);
    headerRow.appendChild(collapseIconSpan);
    return headerRow;
  };

  const createLocationHeaderRow = (locationGroup) => { // New for location headers
    const headerRow = document.createElement('div');
    headerRow.className = 'mh-location-header-row_v2'; // New class for location headers
    headerRow.onclick = () => toggleLocationCollapse(locationGroup); // New toggleLocationCollapse

    const titleSpan = document.createElement('span');
    titleSpan.className = 'mh-location-title_v2'; // New class for location titles
    titleSpan.textContent = locationGroup.groupName; // Location Name

    const collapseIconSpan = document.createElement('span');
    collapseIconSpan.className = 'mh-location-collapse-icon_v2'; // New class for location collapse icons
    collapseIconSpan.textContent = locationGroup.isCollapsed ? '+' : '-';

    headerRow.appendChild(titleSpan);
    headerRow.appendChild(collapseIconSpan);
    return headerRow;
  };


  const createLocationMiceContainer = (locationGroup) => { // New for location mouse containers
    const miceCont = document.createElement('div');
    miceCont.className = 'mh-location-mice-container_v2'; // New class
    miceCont.style.display = locationGroup.isCollapsed ? 'none' : 'block';
    //miceCont.style.height = 'auto'; // Ensure dynamic height

    const sortedMouseData = sortMouseData(locationGroup.mice, ts.initialMouseData);

    sortedMouseData.forEach(mouse => {
      miceCont.appendChild(createMouseRow(mouse, ts.initialMouseData));
    });
    return miceCont;
  };


  const createMouseListHeader = () => {
    const headerRow = document.createElement('div');
    headerRow.id = 'mh-mouse-list-header-row_v2';
    headerRow.innerHTML = `
      <span class="mh-header-name-col_v2">Mouse</span>
      <span class="mh-header-cm-col_v2">C/M</span>
    `;
    return headerRow;
  };

  const createMouseRow = (mouse, initialMouseData) => {
    const mouseDiv = document.createElement('div');
    const nameCol = document.createElement('span');
    nameCol.className = 'mh-mouse-name-col_v2';
    nameCol.textContent = mouse.name;

    const cmCol = document.createElement('span');
    cmCol.className = 'mh-cm-col_v2';
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
      return a.name.localeCompare(b.name);
    });
  };

  const updateUI = () => {
    if (!dom.miceLst) {
      console.error("UI not initialized. Call createUI() first.");
      return;
    }
    updateMouseListUI();
  };

  // Hardcoded data (consider fetching this from API for regions in the future if needed)
  const mouseLocationsData = {"Bionic":["Meadow","Town of Gnawnia","Harbour","Mountain","Laboratory","Town of Digby","Bazaar"],"Brown":["Meadow","Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms"],"Diamond":["Meadow","Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms","Tournament Hall","Town of Digby","Training Grounds","Dojo"],"Dwarf":["Meadow","Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms","Tournament Hall","Calm Clearing","Great Gnarled Tree","Lagoon","Laboratory","Town of Digby","Bazaar","Training Grounds","Muridae Market","S.S. Huntington IV"],"Flying":["Meadow","Town of Gnawnia","Windmill","Mountain","King's Arms","Tournament Hall"],"Gold":["Meadow","Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms","Tournament Hall","Town of Digby","Bazaar","Training Grounds","Dojo"],"Granite":["Meadow","Town of Gnawnia","Harbour","Mountain","Laboratory","Town of Digby","Bazaar"],"Grey":["Meadow","Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms"],"Mole":["Meadow","Windmill","Town of Digby"],"Pirate":["Meadow","Town of Gnawnia","Harbour","Training Grounds","S.S. Huntington IV"],"Steel":["Meadow","Town of Gnawnia","Harbour","Mountain","Laboratory","Town of Digby","Bazaar","Fiery Warpath"],"Terrible Twos":["Meadow","Great Gnarled Tree"],"White":["Meadow","Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms","Tournament Hall","Great Gnarled Tree","Training Grounds","Muridae Market"],"Cowardly":["Meadow","Town of Gnawnia"],"Field":["Meadow","Windmill"],"Lightning Rod":["Meadow","Tournament Hall"],"Tiny":["Meadow","Windmill","King's Arms"],"Spotted":["Meadow","Harbour","King's Arms"],"Snooty":["Meadow","Windmill","Harbour","Mountain","King's Gauntlet","Laboratory","Town of Digby","Toxic Spill","Acolyte Realm","Derr Dunes","Fort Rox","Muridae Market","Living Garden","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Crystal Library","Iceberg","Sunken City","Queso River","Prickly Plains","Cantera Quarry","Queso Geyser","Fungal Cavern","Moussu Picchu","Floating Islands","Table of Contents","Bountiful Beanstalk","School of Sorcery","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Eggsplosive Scientist":["Meadow","Town of Gnawnia","Windmill","Mountain","King's Arms","Tournament Hall","Calm Clearing","Lagoon","Laboratory","Toxic Spill","Dojo","Catacombs","Acolyte Realm","Derr Dunes","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Iceberg","Sunken City","Queso River","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Foreword Farm","Prologue Pond","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Eggscavator":["Meadow","Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms","Tournament Hall","King's Gauntlet","Lagoon","Laboratory","Mousoleum","Bazaar","Toxic Spill","Dojo","Catacombs","Acolyte Realm","Cape Clawed","Derr Dunes","Jungle of Dread","Balack's Cove","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Crystal Library","Sunken City","Queso River","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Foreword Farm","Prologue Pond","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Sinister Egg Painter":["Meadow","Windmill","Harbour","Mountain","King's Arms","Tournament Hall","King's Gauntlet","Lagoon","Laboratory","Dojo","Pinnacle Chamber","Catacombs","Acolyte Realm","Nerg Plains","Derr Dunes","Balack's Cove","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Iceberg","Sunken City","Prickly Plains","Cantera Quarry","Queso Geyser","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Lucky":["Meadow","Harbour","Fiery Warpath","Muridae Market"],"Egg Scrambler":["Meadow","Town of Gnawnia","Windmill","Mountain","King's Arms","Tournament Hall","King's Gauntlet","Calm Clearing","Lagoon","Laboratory","Mousoleum","Toxic Spill","Dojo","Catacombs","Acolyte Realm","Derr Dunes","Dracano","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Sunken City","Queso River","Prickly Plains","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Foreword Farm","Prologue Pond","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Onion Chopper":["Meadow","Windmill","Mountain","King's Arms","Tournament Hall","King's Gauntlet","Lagoon","Laboratory","Mousoleum","Dojo","Meditation Room","Pinnacle Chamber","Acolyte Realm","Claw Shot City","Gnawnian Express Station","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Zugzwang's Tower","Crystal Library","Iceberg","Sunken City","Prickly Plains","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Prologue Pond","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Birthday":["Town of Gnawnia","Great Gnarled Tree","Catacombs","Forbidden Grove"],"Black Widow":["Town of Gnawnia","Harbour","Mountain","King's Arms","Calm Clearing","Great Gnarled Tree","Lagoon","Laboratory","Mousoleum","Town of Digby","Bazaar","Training Grounds","Dojo","Catacombs","Forbidden Grove","Acolyte Realm","Elub Shore","Nerg Plains","Derr Dunes"],"Cupid":["Town of Gnawnia","Training Grounds","Catacombs","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Sand Dunes","S.S. Huntington IV","Sunken City","Queso River","Queso Geyser","Moussu Picchu","Bountiful Beanstalk","Whisker Woods Rift","Bristle Woods Rift","Valour Rift"],"Hollowhead":["Town of Gnawnia","Mountain","Laboratory"],"Rockstar":["Town of Gnawnia","Town of Digby","S.S. Huntington IV"],"Longtail":["Town of Gnawnia","Windmill","King's Arms"],"Master Burglar":["Town of Gnawnia","Bazaar"],"Mobster":["Town of Gnawnia","Laboratory","Mousoleum","Dojo","Catacombs","Elub Shore","Nerg Plains","Derr Dunes","S.S. Huntington IV","Sunken City","School of Sorcery"],"Nibbler":["Town of Gnawnia","King's Arms","Tournament Hall","Great Gnarled Tree","Town of Digby","Bazaar","Training Grounds","Cape Clawed","S.S. Huntington IV"],"Present":["Town of Gnawnia","Tournament Hall","Great Gnarled Tree","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath"],"Romeno":["Town of Gnawnia","Tournament Hall","Training Grounds","Fort Rox","Fiery Warpath","S.S. Huntington IV","Sunken City","Moussu Picchu","Bountiful Beanstalk","Whisker Woods Rift","Bristle Woods Rift","Valour Rift"],"Romeo":["Town of Gnawnia","Training Grounds","Dojo","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","S.S. Huntington IV","Sunken City","Queso River","Prickly Plains","Cantera Quarry","Queso Geyser","Moussu Picchu","Bountiful Beanstalk","Whisker Woods Rift","Bristle Woods Rift","Valour Rift"],"Zombie":["Town of Gnawnia","Mountain","Laboratory","Mousoleum","Town of Digby","Bazaar","Catacombs","Forbidden Grove"],"Speedy":["Town of Gnawnia","Windmill","King's Arms","Tournament Hall"],"Magic":["Town of Gnawnia","Harbour","King's Arms"],"Pugilist":["Town of Gnawnia","Windmill","Harbour","King's Arms","Tournament Hall"],"Silvertail":["Town of Gnawnia","Windmill","Harbour","Mountain","King's Arms","Tournament Hall"],"Gourdborg":["Town of Gnawnia","Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern","Valour Rift"],"Treat":["Town of Gnawnia","Mountain","Laboratory","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern"],"Trick":["Town of Gnawnia","Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern"],"Zombot Unipire":["Town of Gnawnia","Mountain","Mousoleum","Catacombs"],"Treasurer":["Town of Gnawnia","Windmill","Harbour","Mountain","King's Gauntlet","Town of Digby","Toxic Spill","Acolyte Realm","Cape Clawed","Elub Shore","Derr Dunes","Claw Shot City","Fiery Warpath","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Iceberg","Sunken City","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Moussu Picchu","Floating Islands","Prologue Pond","Bountiful Beanstalk","School of Sorcery","Draconic Depths","Gnawnia Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Juliyes":["Town of Gnawnia","Training Grounds","Dojo","Acolyte Realm","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Sand Dunes","S.S. Huntington IV","Sunken City","Queso River","Prickly Plains","Queso Geyser","Moussu Picchu","Bountiful Beanstalk","Whisker Woods Rift","Bristle Woods Rift","Valour Rift"],"Egg Painter":["Town of Gnawnia","Windmill","Harbour","Mountain","Tournament Hall","King's Gauntlet","Calm Clearing","Lagoon","Laboratory","Mousoleum","Town of Digby","Toxic Spill","Dojo","Pinnacle Chamber","Catacombs","Acolyte Realm","Cape Clawed","Elub Shore","Nerg Plains","Jungle of Dread","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Iceberg","Sunken City","Queso River","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Foreword Farm","Prologue Pond","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Hare Razer":["Town of Gnawnia","Windmill","Mountain","King's Arms","Tournament Hall","King's Gauntlet","Lagoon","Laboratory","Dojo","Acolyte Realm","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Sunken City","Queso River","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Floating Islands","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Grave Robber":["Town of Gnawnia","Mousoleum","Catacombs","Slushy Shoreline"],"Cobweb":["Town of Gnawnia","Mountain"],"Pumpkin Hoarder":["Town of Gnawnia","Mountain"],"Melancholy Merchant":["Town of Gnawnia","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Sand Dunes","S.S. Huntington IV","Sunken City","Queso River","Cantera Quarry","Moussu Picchu","Bountiful Beanstalk","Whisker Woods Rift","Bristle Woods Rift","Valour Rift"],"Swamp Thang":["Town of Gnawnia","Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern","Valour Rift"],"Spirit Light":["Town of Gnawnia","Mountain"],"Hardboiled":["Town of Gnawnia","Windmill","Mountain","King's Gauntlet","Lagoon","Laboratory","Dojo","Catacombs","Acolyte Realm","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Zugzwang's Tower","Crystal Library","Iceberg","Sunken City","Queso River","Prickly Plains","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Foreword Farm","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Titanic Brain-Taker":["Town of Gnawnia","Mountain","Laboratory","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern","Valour Rift"],"Pan Slammer":["Town of Gnawnia","Mountain","King's Arms","Tournament Hall","King's Gauntlet","Laboratory","Mousoleum","Town of Digby","Acolyte Realm","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Iceberg","Sunken City","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Candy Cat":["Town of Gnawnia","Mountain","Laboratory"],"Grey Recluse":["Town of Gnawnia","Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Sunken City","Fungal Cavern"],"Tricky Witch":["Town of Gnawnia","Mountain","Slushy Shoreline"],"Chocolate Gold Foil":["Town of Gnawnia","Harbour","King's Arms","King's Gauntlet","Lagoon","Dojo","Pinnacle Chamber","Acolyte Realm","Derr Dunes","Jungle of Dread","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Sunken City","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Bountiful Beanstalk","Gnawnia Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Bonbon Gummy Globlin":["Town of Gnawnia","Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern","Valour Rift"],"Teenage Vampire":["Town of Gnawnia","Mountain","Laboratory","Slushy Shoreline"],"Eggsquisite Entertainer":["Town of Gnawnia","Harbour","Mountain","Lagoon","Laboratory","Town of Digby","Dojo","Acolyte Realm","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","S.S. Huntington IV","Crystal Library","Slushy Shoreline","Iceberg","Sunken City","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Bountiful Beanstalk","Gnawnia Rift","Bristle Woods Rift","Valour Rift"],"Spring Sprig":["Town of Gnawnia","Windmill","Mountain","King's Gauntlet","Lagoon","Laboratory","Meditation Room","Catacombs","Acolyte Realm","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Iceberg","Sunken City","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Admiral Arrrgh":["Town of Gnawnia","Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern"],"Farmhand":["Windmill"],"Scruffy":["Windmill","Harbour","King's Arms"],"Spud":["Windmill"],"Carefree Cook":["Windmill","Mountain","King's Arms","Tournament Hall","Calm Clearing","Lagoon","Laboratory","Mousoleum","Town of Digby","Toxic Spill","Dojo","Catacombs","Acolyte Realm","Derr Dunes","Jungle of Dread","Balack's Cove","Gnawnian Express Station","Fort Rox","Muridae Market","Living Garden","Sand Dunes","S.S. Huntington IV","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Iceberg","Sunken City","Cantera Quarry","Queso Geyser","Labyrinth","Zokor","Floating Islands","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Captain Croissant":["Windmill"],"Burglar":["Harbour","King's Arms","Tournament Hall","Laboratory","Bazaar"],"Ninja":["Harbour","Mountain","Training Grounds","Dojo"],"Fog":["Harbour","Mountain"],"High Roller":["Harbour","Mountain","Mousoleum","Town of Digby","Toxic Spill","Catacombs","Acolyte Realm","Fort Rox","Fiery Warpath","Living Garden","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Iceberg","Sunken City","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Bountiful Beanstalk","School of Sorcery","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Coco Commander":["Harbour","Tournament Hall","King's Gauntlet","Lagoon","Mousoleum","Dojo","Acolyte Realm","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Zugzwang's Tower","Crystal Library","Sunken City","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Floating Islands","Foreword Farm","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Relic Hunter":["Harbour","Mountain","King's Arms","Lagoon","Laboratory","Town of Digby","Bazaar","Acolyte Realm","Derr Dunes","Claw Shot City","Fiery Warpath","Muridae Market","Living Garden","S.S. Huntington IV","Seasonal Garden","Slushy Shoreline","Sunken City","Fungal Cavern","Moussu Picchu","Floating Islands","Foreword Farm","Prologue Pond","Table of Contents","Bountiful Beanstalk","School of Sorcery","Draconic Depths"],"M400":["Harbour","King's Gauntlet","Town of Digby","Dojo","Meditation Room","Elub Shore","Seasonal Garden","Iceberg"],"Barmy Gunner":["Harbour"],"Bilged Boatswain":["Harbour"],"Cabin Boy":["Harbour"],"Corrupt Commodore":["Harbour"],"Dashing Buccaneer":["Harbour"],"Abominable Snow":["Mountain","Laboratory","Training Grounds"],"Frosty Snow":["Mountain"],"Frozen":["Mountain"],"Pebble":["Mountain"],"Mousataur Priestess":["Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern"],"Sandmouse":["Mountain","Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern"],"Craggy Ore":["Mountain"],"Mountain":["Mountain"],"Slope Swimmer":["Mountain"],"Crown Collector":["King's Arms","Tournament Hall","Bazaar","S.S. Huntington IV","Crystal Library"],"Candy Cane":["Tournament Hall","Great Gnarled Tree","Jungle of Dread","Dracano","Muridae Market"],"Christmas Tree":["Tournament Hall","Great Gnarled Tree","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath","Muridae Market"],"Elf":["Tournament Hall","Great Gnarled Tree","Laboratory","Catacombs","Dracano","Balack's Cove","Fiery Warpath"],"New Year's":["Tournament Hall","Dracano"],"Nutcracker":["Tournament Hall","Great Gnarled Tree","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath","Muridae Market"],"Ornament":["Tournament Hall","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath"],"Scrooge":["Tournament Hall","Great Gnarled Tree","Jungle of Dread","Dracano","Fiery Warpath"],"Stocking":["Tournament Hall","Great Gnarled Tree","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath","Muridae Market"],"Toy":["Tournament Hall","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath"],"Troll":["Tournament Hall","Lagoon","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath"],"Missile Toe":["Tournament Hall","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath"],"Slay Ride":["Tournament Hall","Dracano","Balack's Cove","Fiery Warpath"],"Snow Fort":["Tournament Hall","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath","Muridae Market"],"Squeaker Claws":["Tournament Hall","Dracano","Muridae Market"],"Wreath Thief":["Tournament Hall","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath"],"Mouse of Winter Future":["Tournament Hall","Balack's Cove"],"Mouse of Winter Present":["Tournament Hall","Dracano"],"Destructoy":["Tournament Hall","Great Gnarled Tree","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath","Muridae Market"],"Snow Scavenger":["Tournament Hall","Dracano","Balack's Cove","Fiery Warpath","Muridae Market"],"Toy Tinkerer":["Tournament Hall","Dracano","Balack's Cove","Fiery Warpath","Muridae Market"],"Mad Elf":["Tournament Hall"],"Party Head":["Tournament Hall","Dracano"],"Hurdle":["Tournament Hall"],"Extreme Everysports":["Tournament Hall"],"Trampoline":["Tournament Hall"],"Winter Games":["Tournament Hall"],"Wave Racer":["Tournament Hall"],"Aquos":["King's Gauntlet"],"Bandit":["King's Gauntlet"],"Berserker":["King's Gauntlet"],"Black Mage":["King's Gauntlet"],"Hapless Marionette":["King's Gauntlet"],"Cavalier":["King's Gauntlet"],"Clockwork Samurai":["King's Gauntlet"],"Cowbell":["King's Gauntlet"],"Dancer":["King's Gauntlet"],"Drummer":["King's Gauntlet"],"Eclipse":["King's Gauntlet"],"Escape Artist":["King's Gauntlet"],"Fencer":["King's Gauntlet"],"Fiddler":["King's Gauntlet"],"Fiend":["King's Gauntlet"],"Glitchpaw":["King's Gauntlet","Calm Clearing","Great Gnarled Tree","Mousoleum","Cape Clawed","Derr Dunes","Claw Shot City","Fiery Warpath","Prologue Pond","Table of Contents"],"Guqin Player":["King's Gauntlet"],"Ignis":["King's Gauntlet"],"Impersonator":["King's Gauntlet"],"Knight":["King's Gauntlet"],"Lockpick":["King's Gauntlet"],"Necromancer":["King's Gauntlet"],"Page":["King's Gauntlet"],"Paladin":["King's Gauntlet"],"Phalanx":["King's Gauntlet"],"Puppet Master":["King's Gauntlet"],"Rogue":["King's Gauntlet"],"Sacred Shrine":["King's Gauntlet"],"Sock Puppet Ghost":["King's Gauntlet"],"Stealth":["King's Gauntlet"],"Terra":["King's Gauntlet"],"Toy Sylvan":["King's Gauntlet"],"White Mage":["King's Gauntlet"],"Wound Up White":["King's Gauntlet"],"Zephyr":["King's Gauntlet"],"Bear":["Calm Clearing","Great Gnarled Tree","Fiery Warpath"],"Chameleon":["Calm Clearing","Great Gnarled Tree","Cape Clawed","Nerg Plains"],"Cyclops":["Calm Clearing","Lagoon"],"Eagle Owl":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Elven Princess":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Foxy":["Calm Clearing","Great Gnarled Tree"],"Frog":["Calm Clearing","Great Gnarled Tree"],"Moosker":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Shaman":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Sylvan":["Calm Clearing","Great Gnarled Tree","Lagoon","Cape Clawed","Derr Dunes","Jungle of Dread"],"Treant":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Wiggler":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Cherry":["Calm Clearing"],"Bat":["Great Gnarled Tree","Mousoleum","Town of Digby","Catacombs","Forbidden Grove"],"Centaur":["Great Gnarled Tree","Lagoon"],"Curious Chemist":["Great Gnarled Tree"],"Fairy":["Great Gnarled Tree","Lagoon"],"Nomad":["Great Gnarled Tree","Lagoon","S.S. Huntington IV"],"Tiger":["Great Gnarled Tree","Lagoon"],"Wicked Witch of Whisker Woods":["Great Gnarled Tree","Lagoon"],"Goldleaf":["Great Gnarled Tree"],"Goblin":["Lagoon"],"Harpy":["Lagoon"],"Hydra":["Lagoon","Jungle of Dread","Dracano","Balack's Cove","Fiery Warpath","S.S. Huntington IV"],"Silth":["Lagoon","Fungal Cavern"],"Water Nymph":["Lagoon","S.S. Huntington IV"],"Leprechaun":["Laboratory","Mousoleum","Town of Digby","Dojo","Fungal Cavern","Bountiful Beanstalk","School of Sorcery"],"Monster":["Laboratory","Mousoleum","Catacombs"],"Mutated Grey":["Laboratory","Mousoleum","Bazaar","Forbidden Grove","Acolyte Realm"],"Mutated White":["Laboratory","Mousoleum","Bazaar","Forbidden Grove","Acolyte Realm"],"Chocolate Overload":["Laboratory","Dojo","Acolyte Realm","Dracano","Claw Shot City","Gnawnian Express Station","Fort Rox","Fiery Warpath","Muridae Market","Living Garden","Lost City","Sand Dunes","S.S. Huntington IV","Seasonal Garden","Zugzwang's Tower","Crystal Library","Slushy Shoreline","Sunken City","Cantera Quarry","Queso Geyser","Fungal Cavern","Labyrinth","Zokor","Moussu Picchu","Floating Islands","Table of Contents","Bountiful Beanstalk","Gnawnia Rift","Burroughs Rift","Whisker Woods Rift","Furoma Rift","Bristle Woods Rift","Valour Rift"],"Mutated Brown":["Laboratory","Bazaar","Forbidden Grove","Acolyte Realm"],"Clumsy Chemist":["Laboratory"],"Mutated Mole":["Laboratory"],"Sludge Scientist":["Laboratory"],"Squeaker Bot":["Laboratory"],"Brothers Grimmaus":["Laboratory","Table of Contents"],"Ghost":["Mousoleum","Catacombs","Forbidden Grove"],"Giant Snail":["Mousoleum","Catacombs"],"Lycan":["Mousoleum","Catacombs","Forbidden Grove"],"Mummy":["Mousoleum","Catacombs"],"Ravenous Zombie":["Mousoleum","Catacombs","Forbidden Grove"],"Vampire":["Mousoleum","Catacombs","Forbidden Grove"],"Mousevina von Vermin":["Mousoleum"],"Gluttonous Zombie":["Mousoleum","Catacombs"],"Coffin Zombie":["Mousoleum"],"Big Bad Burroughs":["Town of Digby"],"Core Sample":["Town of Digby"],"Demolitions":["Town of Digby"],"Hope":["Town of Digby","Bazaar","Training Grounds"],"Industrious Digger":["Town of Digby"],"Itty-Bitty Burroughs":["Town of Digby"],"Lambent Crystal":["Town of Digby"],"Miner":["Town of Digby"],"Nugget":["Town of Digby"],"Rock Muncher":["Town of Digby"],"Stone Cutter":["Town of Digby"],"Subterranean":["Town of Digby"],"Mutated Behemoth":["Toxic Spill"],"Biohazard":["Toxic Spill"],"Bog Beast":["Toxic Spill"],"Gelatinous Octahedron":["Toxic Spill"],"Hazmat":["Toxic Spill"],"Lab Technician":["Toxic Spill"],"The Menace":["Toxic Spill"],"Monster Tail":["Toxic Spill"],"Mutant Mongrel":["Toxic Spill"],"Mutant Ninja":["Toxic Spill"],"Mutated Siblings":["Toxic Spill"],"Outbreak Assassin":["Toxic Spill"],"Plague Hag":["Toxic Spill"],"Scrap Metal Monster":["Toxic Spill"],"Slimefist":["Toxic Spill"],"Sludge":["Toxic Spill"],"Sludge Soaker":["Toxic Spill"],"Sludge Swimmer":["Toxic Spill"],"Spore":["Toxic Spill"],"Swamp Runner":["Toxic Spill"],"Telekinetic Mutant":["Toxic Spill"],"Tentacle":["Toxic Spill"],"Toxic Warrior":["Toxic Spill"],"Archer":["Training Grounds","Dojo"],"Assassin":["Training Grounds","Dojo"],"Costumed Tiger":["Training Grounds","Dojo","Muridae Market","S.S. Huntington IV","Queso River","Fungal Cavern","Moussu Picchu","Foreword Farm"],"Dumpling Chef":["Training Grounds","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu"],"Kung Fu":["Training Grounds","Dojo"],"Monk":["Training Grounds","Dojo"],"Red Envelope":["Training Grounds","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu"],"Samurai":["Training Grounds","Dojo"],"Worker":["Training Grounds","Dojo"],"Costumed Rabbit":["Training Grounds","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Hapless":["Dojo","Meditation Room","Pinnacle Chamber"],"Student of the Cheese Belt":["Dojo"],"Student of the Cheese Claw":["Dojo"],"Student of the Cheese Fang":["Dojo"],"Calligraphy":["Dojo","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu"],"Costumed Dragon":["Dojo","Claw Shot City","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Costumed Snake":["Dojo","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Totally Not Tax Fraud":["Dojo","Fort Rox","Fiery Warpath","Living Garden","Sand Dunes","S.S. Huntington IV","Sunken City","Queso River","Queso Geyser","Moussu Picchu","Bountiful Beanstalk","Whisker Woods Rift","Valour Rift"],"Lovely Sports":["Dojo","Fort Rox","Sand Dunes","S.S. Huntington IV","Sunken City","Queso River","Prickly Plains","Moussu Picchu","Bountiful Beanstalk","Whisker Woods Rift","Bristle Woods Rift","Valour Rift"],"Costumed Sheep":["Dojo","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Costumed Rooster":["Dojo","Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Costumed Rat":["Dojo","Muridae Market","S.S. Huntington IV","Queso River","Fungal Cavern","Moussu Picchu","Foreword Farm"],"Master of the Cheese Belt":["Meditation Room"],"Master of the Cheese Claw":["Meditation Room"],"Master of the Cheese Fang":["Meditation Room"],"Dojo Sensei":["Pinnacle Chamber"],"Master of the Dojo":["Pinnacle Chamber"],"Golem":["Catacombs","Forbidden Grove","Acolyte Realm"],"Keeper":["Catacombs"],"Keeper's Assistant":["Catacombs"],"Ooze":["Catacombs"],"Scavenger":["Catacombs","Forbidden Grove"],"Skeleton":["Catacombs"],"Spider":["Catacombs","Forbidden Grove"],"Terror Knight":["Catacombs"],"Snowflake":["Catacombs","Balack's Cove"],"Gargoyle":["Forbidden Grove"],"Gate Guardian":["Forbidden Grove","Acolyte Realm"],"Gorgon":["Forbidden Grove","Acolyte Realm"],"Reaper":["Forbidden Grove"],"Sorcerer":["Forbidden Grove","Acolyte Realm"],"Spectre":["Forbidden Grove","Acolyte Realm"],"Realm Ripper":["Forbidden Grove"],"Acolyte":["Acolyte Realm"],"Lich":["Acolyte Realm"],"Wight":["Acolyte Realm"],"Chrono":["Acolyte Realm"],"Mythweaver":["Acolyte Realm","Table of Contents"],"Aged":["Cape Clawed"],"Alchemist":["Cape Clawed","Elub Shore"],"Caretaker":["Cape Clawed","Nerg Plains"],"Elder":["Cape Clawed"],"Grandfather":["Cape Clawed"],"Healer":["Cape Clawed","Derr Dunes"],"Narrator":["Cape Clawed","Nerg Plains"],"Pathfinder":["Cape Clawed","Nerg Plains"],"Pinchy":["Cape Clawed","Elub Shore","S.S. Huntington IV"],"Scout":["Cape Clawed","Elub Shore"],"Shipwrecked":["Cape Clawed","S.S. Huntington IV"],"Taleweaver":["Cape Clawed","Elub Shore"],"Trailblazer":["Cape Clawed","Derr Dunes"],"Wordsmith":["Cape Clawed","Derr Dunes"],"Alnitak":["Elub Shore"],"Champion":["Elub Shore"],"Elub Chieftain":["Elub Shore"],"Mystic":["Elub Shore"],"Pack":["Elub Shore"],"Protector":["Elub Shore"],"Soothsayer":["Elub Shore"],"Vanquisher":["Elub Shore"],"Alnilam":["Nerg Plains"],"Beast Tamer":["Nerg Plains"],"Conjurer":["Nerg Plains"],"Conqueror":["Nerg Plains"],"Defender":["Nerg Plains"],"Finder":["Nerg Plains"],"Nerg Chieftain":["Nerg Plains"],"Slayer":["Nerg Plains"],"Derr Chieftain":["Derr Dunes"],"Gladiator":["Derr Dunes"],"Grunt":["Derr Dunes"],"Guardian":["Derr Dunes"],"Mintaka":["Derr Dunes"],"Renegade":["Derr Dunes"],"Seer":["Derr Dunes"],"Spellbinder":["Derr Dunes"],"Chitinous":["Jungle of Dread"],"Fetid Swamp":["Jungle of Dread"],"Jurassic":["Jungle of Dread"],"Magma Carrier":["Jungle of Dread"],"Swarm of Pygmy Mice":["Jungle of Dread"],"Primal":["Jungle of Dread"],"Stonework Warrior":["Jungle of Dread"],"Pygmy Wrangler":["Jungle of Dread"],"Draconic Warden":["Dracano"],"Dragon":["Dracano"],"Whelpling":["Dracano"],"Balack the Banished":["Balack's Cove"],"Brimstone":["Balack's Cove"],"Davy Jones":["Balack's Cove"],"Derr Lich":["Balack's Cove"],"Elub Lich":["Balack's Cove"],"Enslaved Spirit":["Balack's Cove"],"Nerg Lich":["Balack's Cove"],"Riptide":["Balack's Cove"],"Twisted Fiend":["Balack's Cove"],"Tidal Fisher":["Balack's Cove"],"Bartender":["Claw Shot City","Gnawnian Express Station"],"Bounty Hunter":["Claw Shot City"],"Cardshark":["Claw Shot City"],"Circuit Judge":["Claw Shot City"],"Coal Shoveller":["Claw Shot City","Gnawnian Express Station"],"Desperado":["Claw Shot City"],"Farrier":["Claw Shot City","Gnawnian Express Station"],"Lasso Cowgirl":["Claw Shot City"],"Outlaw":["Claw Shot City"],"Parlour Player":["Claw Shot City","Gnawnian Express Station"],"Prospector":["Claw Shot City"],"Pyrite":["Claw Shot City"],"Ruffian":["Claw Shot City"],"Saloon Gal":["Claw Shot City"],"Shopkeeper":["Claw Shot City"],"Stagecoach Driver":["Claw Shot City"],"Stuffy Banker":["Claw Shot City","Gnawnian Express Station"],"Tonic Salesman":["Claw Shot City","Gnawnian Express Station"],"Tumbleweed":["Claw Shot City"],"Undertaker":["Claw Shot City"],"Upper Class Lady":["Claw Shot City","Gnawnian Express Station"],"Gentleman Caller":["Claw Shot City","Fiery Warpath","Living Garden","Sand Dunes","S.S. Huntington IV","Sunken City","Queso River","Bountiful Beanstalk","Whisker Woods Rift","Bristle Woods Rift","Valour Rift"],"Lunar Red Candle Maker":["Claw Shot City","Muridae Market","S.S. Huntington IV","Queso River","Fungal Cavern","Foreword Farm"],"Angry Train Staff":["Gnawnian Express Station"],"Automorat":["Gnawnian Express Station"],"Black Powder Thief":["Gnawnian Express Station"],"Cannonball":["Gnawnian Express Station"],"Crate Camo":["Gnawnian Express Station"],"Cute Crate Carrier":["Gnawnian Express Station"],"Fuel":["Gnawnian Express Station"],"Hookshot":["Gnawnian Express Station"],"Magmatic Crystal Thief":["Gnawnian Express Station"],"Magmatic Golem":["Gnawnian Express Station"],"Mouse With No Name":["Gnawnian Express Station"],"Mysterious Traveller":["Gnawnian Express Station"],"Passenger":["Gnawnian Express Station"],"Photographer":["Gnawnian Express Station"],"Sharpshooter":["Gnawnian Express Station"],"Steel Horse Rider":["Gnawnian Express Station"],"Stoutgear":["Gnawnian Express Station"],"Stowaway":["Gnawnian Express Station"],"Supply Hoarder":["Gnawnian Express Station"],"Dangerous Duo":["Gnawnian Express Station"],"Train Conductor":["Gnawnian Express Station"],"Train Engineer":["Gnawnian Express Station"],"Travelling Barber":["Gnawnian Express Station"],"Warehouse Manager":["Gnawnian Express Station"],"Arcane Summoner":["Fort Rox"],"Meteorite Mover":["Fort Rox"],"Battering Ram":["Fort Rox"],"Cursed Taskmaster":["Fort Rox"],"Dawn Guardian":["Fort Rox"],"Mining Materials Manager":["Fort Rox"],"Night Shift Materials Manager":["Fort Rox"],"Hardworking Hauler":["Fort Rox"],"Mischievous Meteorite Miner":["Fort Rox"],"Mischievous Wereminer":["Fort Rox"],"Monster of the Meteor":["Fort Rox"],"Meteorite Golem":["Fort Rox"],"Meteorite Miner":["Fort Rox"],"Meteorite Mystic":["Fort Rox"],"Hypnotized Gunslinger":["Fort Rox"],"Meteorite Snacker":["Fort Rox"],"Night Watcher":["Fort Rox"],"Nightfire":["Fort Rox"],"Nightmancer":["Fort Rox"],"Reveling Lycanthrope":["Fort Rox"],"Wealthy Werewarrior":["Fort Rox"],"Alpha Weremouse":["Fort Rox"],"Werehauler":["Fort Rox"],"Wereminer":["Fort Rox"],"Heart of the Meteor":["Fort Rox"],"Flame Archer":["Fiery Warpath"],"Crimson Ranger":["Fiery Warpath"],"Desert Archer":["Fiery Warpath"],"Flame Ordnance":["Fiery Warpath"],"Gargantuamouse":["Fiery Warpath"],"Warmonger":["Fiery Warpath"],"Sand Cavalry":["Fiery Warpath"],"Sandwing Cavalry":["Fiery Warpath"],"Theurgy Warden":["Fiery Warpath"],"Crimson Commander":["Fiery Warpath"],"Inferno Mage":["Fiery Warpath"],"Magmarage":["Fiery Warpath"],"Sentinel":["Fiery Warpath"],"Crimson Watch":["Fiery Warpath"],"Vanguard":["Fiery Warpath"],"Caravan Guard":["Fiery Warpath"],"Flame Warrior":["Fiery Warpath"],"Crimson Titan":["Fiery Warpath"],"Desert Soldier":["Fiery Warpath"],"Wild Chainsaw":["Fiery Warpath","Muridae Market"],"Confused Courier":["Fiery Warpath"],"Sugar Rush":["Fiery Warpath","Muridae Market","Sunken City","Fungal Cavern"],"Hollowed":["Fiery Warpath","Muridae Market","Fungal Cavern","Valour Rift"],"Shortcut":["Fiery Warpath","Muridae Market"],"Dire Lycan":["Fiery Warpath","Muridae Market","Sunken City"],"Gourd Ghoul":["Fiery Warpath","Muridae Market","Slushy Shoreline","Sunken City","Fungal Cavern"],"Hollowed Minion":["Fiery Warpath","Muridae Market","Sunken City","Fungal Cavern","Valour Rift"],"Maize Harvester":["Fiery Warpath","Muridae Market","Slushy Shoreline","Fungal Cavern","Valour Rift"],"Spectral Butler":["Fiery Warpath","Muridae Market","Slushy Shoreline","Sunken City","Fungal Cavern","Valour Rift"],"Creepy Marionette":["Fiery Warpath","Muridae Market","Slushy Shoreline","Sunken City","Fungal Cavern","Valour Rift"],"Tomb Exhumer":["Fiery Warpath","Muridae Market","Fungal Cavern","Burroughs Rift"],"Artillery Commander":["Fiery Warpath"],"Captain Cannonball":["Fiery Warpath","Muridae Market","Slushy Shoreline"],"Ghost Pirate Queen":["Fiery Warpath","Muridae Market","Sunken City","Fungal Cavern","Valour Rift"],"Spectral Swashbuckler":["Fiery Warpath","Fungal Cavern","Valour Rift"],"Blacksmith":["Muridae Market"],"Lumberjack":["Muridae Market"],"Desert Nomad":["Muridae Market"],"Desert Architect":["Muridae Market"],"Falling Carpet":["Muridae Market"],"Glass Blower":["Muridae Market"],"Limestone Miner":["Muridae Market"],"Mage Weaver":["Muridae Market"],"Market Guard":["Muridae Market"],"Market Thief":["Muridae Market"],"Pie Thief":["Muridae Market"],"Snake Charmer":["Muridae Market"],"Spice Merchant":["Muridae Market"],"Costumed Horse":["Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Costumed Monkey":["Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Scorned Pirate":["Muridae Market","Fungal Cavern","Valour Rift"],"Costumed Dog":["Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Costumed Pig":["Muridae Market","S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Bark":["Living Garden"],"Barkshell":["Living Garden"],"Calalilly":["Living Garden"],"Camoflower":["Living Garden"],"Camofusion":["Living Garden"],"Carmine the Apothecary":["Living Garden"],"Dehydrated":["Living Garden"],"Fungal Spore":["Living Garden"],"Shroom":["Living Garden"],"Strawberry Hotcakes":["Living Garden"],"Thirsty":["Living Garden"],"Thistle":["Living Garden"],"Thorn":["Living Garden"],"Twisted Carmine":["Living Garden"],"Twisted Hotcakes":["Living Garden"],"Twisted Lilly":["Living Garden"],"Shattered Carmine":["Living Garden"],"Hans Cheesetian Squeakersen":["Living Garden","Table of Contents"],"Corrupt":["Lost City"],"Cursed":["Lost City"],"Cursed Enchanter":["Lost City"],"Cursed Engineer":["Lost City"],"Cursed Librarian":["Lost City"],"Cursed Thief":["Lost City"],"Essence Collector":["Lost City"],"Essence Guardian":["Lost City"],"Ethereal Enchanter":["Lost City"],"Ethereal Engineer":["Lost City"],"Ethereal Librarian":["Lost City"],"Ethereal Thief":["Lost City"],"Dark Magi":["Lost City"],"Dunehopper":["Sand Dunes"],"Grubling":["Sand Dunes"],"Grubling Herder":["Sand Dunes"],"King Grub":["Sand Dunes"],"Quesodillo":["Sand Dunes"],"Sand Colossus":["Sand Dunes"],"Sand Pilgrim":["Sand Dunes"],"Sarcophamouse":["Sand Dunes"],"Scarab":["Sand Dunes"],"Serpentine":["Sand Dunes"],"Spiky Devil":["Sand Dunes"],"King Scarab":["Sand Dunes"],"Bottled":["S.S. Huntington IV"],"Briegull":["S.S. Huntington IV"],"Buccaneer":["S.S. Huntington IV"],"Captain":["S.S. Huntington IV"],"Cook":["S.S. Huntington IV"],"Leviathan":["S.S. Huntington IV"],"Mermouse":["S.S. Huntington IV"],"Salt Water Snapper":["S.S. Huntington IV"],"Shelder":["S.S. Huntington IV"],"Siren":["S.S. Huntington IV"],"Squeaken":["S.S. Huntington IV"],"Swabbie":["S.S. Huntington IV"],"Costumed Ox":["S.S. Huntington IV","Queso River","Moussu Picchu","Foreword Farm"],"Derpicorn":["Seasonal Garden"],"Fall Familiar":["Seasonal Garden"],"Firebreather":["Seasonal Garden"],"Firefly":["Seasonal Garden"],"Frostbite":["Seasonal Garden"],"Harvest Harrier":["Seasonal Garden"],"Harvester":["Seasonal Garden"],"Hot Head":["Seasonal Garden"],"Hydrophobe":["Seasonal Garden"],"Icicle":["Seasonal Garden"],"Monarch":["Seasonal Garden"],"Over-Prepared":["Seasonal Garden"],"Penguin":["Seasonal Garden"],"Puddlemancer":["Seasonal Garden"],"Pumpkin Head":["Seasonal Garden"],"Scarecrow":["Seasonal Garden"],"Spring Familiar":["Seasonal Garden"],"Stinger":["Seasonal Garden"],"Summer Mage":["Seasonal Garden"],"Tanglefoot":["Seasonal Garden"],"Vinetail":["Seasonal Garden"],"Whirleygig":["Seasonal Garden"],"Winter Mage":["Seasonal Garden"],"Bruticle":["Seasonal Garden"],"Mystic Bishop":["Zugzwang's Tower"],"Mystic King":["Zugzwang's Tower"],"Mystic Knight":["Zugzwang's Tower"],"Mystic Pawn":["Zugzwang's Tower"],"Mystic Queen":["Zugzwang's Tower"],"Mystic Rook":["Zugzwang's Tower"],"Technic Bishop":["Zugzwang's Tower"],"Technic King":["Zugzwang's Tower"],"Technic Knight":["Zugzwang's Tower"],"Technic Pawn":["Zugzwang's Tower"],"Technic Queen":["Zugzwang's Tower"],"Technic Rook":["Zugzwang's Tower"],"Chess Master":["Zugzwang's Tower"],"Aether":["Crystal Library"],"Bookborn":["Crystal Library"],"Effervescent":["Crystal Library"],"Explorator":["Crystal Library"],"Flutterby":["Crystal Library"],"Infiltrator":["Crystal Library"],"Zurreal the Eternal":["Crystal Library"],"Pocketwatch":["Crystal Library"],"Scribe":["Crystal Library"],"Steam Grip":["Crystal Library"],"Tome Sprite":["Crystal Library"],"Walker":["Crystal Library"],"Incompetent Ice Climber":["Slushy Shoreline","Iceberg"],"Polar Bear":["Slushy Shoreline","Iceberg"],"Snow Soldier":["Slushy Shoreline","Iceberg"],"Chipper":["Slushy Shoreline","Iceberg"],"Snow Bowler":["Slushy Shoreline","Iceberg"],"Snow Slinger":["Slushy Shoreline","Iceberg"],"Icebreaker":["Slushy Shoreline","Iceberg"],"Saboteur":["Slushy Shoreline","Iceberg"],"Snow Sniper":["Slushy Shoreline"],"Yeti":["Slushy Shoreline","Iceberg"],"Living Ice":["Slushy Shoreline"],"Candy Goblin":["Slushy Shoreline"],"Wolfskie":["Iceberg"],"General Drheller":["Iceberg"],"Frostlance Guard":["Iceberg"],"Frostwing Commander":["Iceberg"],"Heavy Blaster":["Iceberg"],"Iceblade":["Iceberg"],"Iceblock":["Iceberg"],"Icewing":["Iceberg"],"Lady Coldsnap":["Iceberg"],"Lord Splodington":["Iceberg"],"Mammoth":["Iceberg"],"Princess Fist":["Iceberg"],"Snowblind":["Iceberg"],"Stickybomber":["Iceberg"],"Water Wielder":["Iceberg"],"Living Salt":["Iceberg"],"Deep":["Iceberg"],"Ancient of the Deep":["Sunken City"],"Angelfish":["Sunken City"],"Angler":["Sunken City"],"Barnacle Beautician":["Sunken City"],"Barracuda":["Sunken City"],"Betta":["Sunken City"],"Bottom Feeder":["Sunken City"],"Carnivore":["Sunken City"],"City Noble":["Sunken City"],"City Worker":["Sunken City"],"Clownfish":["Sunken City"],"Clumsy Carrier":["Sunken City"],"Coral":["Sunken City"],"Coral Cuddler":["Sunken City"],"Coral Dragon":["Sunken City"],"Coral Gardener":["Sunken City"],"Coral Guard":["Sunken City"],"Coral Harvester":["Sunken City"],"Coral Queen":["Sunken City"],"Crabolia":["Sunken City"],"Cuttle":["Sunken City"],"Deep Sea Diver":["Sunken City"],"Deranged Deckhand":["Sunken City"],"Derpshark":["Sunken City"],"Dread Piratert":["Sunken City"],"Eel":["Sunken City"],"Elite Guardian":["Sunken City"],"Enginseer":["Sunken City"],"Guppy":["Sunken City"],"Hydrologist":["Sunken City"],"Jellyfish":["Sunken City"],"Koimaid":["Sunken City"],"Manatee":["Sunken City"],"Mermousette":["Sunken City"],"Mershark":["Sunken City"],"Mlounder Flounder":["Sunken City"],"Octomermaid":["Sunken City"],"Old One":["Sunken City"],"Oxygen Baron":["Sunken City"],"Pearl":["Sunken City"],"Pearl Diver":["Sunken City"],"Pirate Anchor":["Sunken City"],"Puffer":["Sunken City"],"Saltwater Axolotl":["Sunken City"],"Sand Dollar Diver":["Sunken City"],"Sand Dollar Queen":["Sunken City"],"School of Mish":["Sunken City"],"Seadragon":["Sunken City"],"Serpent Monster":["Sunken City"],"Spear Fisher":["Sunken City"],"Stingray":["Sunken City"],"Sunken Banshee":["Sunken City"],"Sunken Citizen":["Sunken City"],"Swashblade":["Sunken City"],"Tadpole":["Sunken City"],"Treasure Hoarder":["Sunken City"],"Treasure Keeper":["Sunken City"],"Tritus":["Sunken City"],"Turret Guard":["Sunken City"],"Urchin King":["Sunken City"],"Croquet Crusher":["Queso River"],"Pump Raider":["Queso River"],"Queso Extractor":["Queso River"],"Queen Quesada":["Queso River"],"Sleepy Merchant":["Queso River"],"Tiny Saboteur":["Queso River"],"Old Spice Collector":["Prickly Plains"],"Spice Farmer":["Prickly Plains"],"Spice Finder":["Prickly Plains"],"Granny Spice":["Prickly Plains"],"Spice Raider":["Prickly Plains"],"Spice Reaper":["Prickly Plains"],"Spice Seer":["Prickly Plains"],"Inferna the Engulfed":["Prickly Plains"],"Spice Sovereign":["Prickly Plains"],"Chip Chiseler":["Cantera Quarry"],"Fiery Crusher":["Cantera Quarry"],"Grampa Golem":["Cantera Quarry"],"Nachore Golem":["Cantera Quarry"],"Nachous the Molten":["Cantera Quarry"],"Ore Chipper":["Cantera Quarry"],"Rubble Rouser":["Cantera Quarry"],"Rubble Rummager":["Cantera Quarry"],"Tiny Toppler":["Cantera Quarry"],"Matriarch Gander":["Cantera Quarry","Table of Contents"],"Fuzzy Drake":["Queso Geyser"],"Rambunctious Rain Rumbler":["Queso Geyser"],"Horned Cork Hoarder":["Queso Geyser"],"Burly Bruiser":["Queso Geyser"],"Cork Defender":["Queso Geyser"],"Corky the Collector":["Queso Geyser"],"Corkataur":["Queso Geyser"],"Stormsurge the Vile Tempest":["Queso Geyser"],"Bruticus the Blazing":["Queso Geyser"],"Ignatia":["Queso Geyser"],"Cinderstorm":["Queso Geyser"],"Bearded Elder":["Queso Geyser"],"Smoldersnap":["Queso Geyser"],"Mild Spicekin":["Queso Geyser"],"Sizzle Pup":["Queso Geyser"],"Kalor'ignis of the Geyser":["Queso Geyser"],"Pyrehyde":["Queso Geyser"],"Vaporior":["Queso Geyser"],"Warming Wyvern":["Queso Geyser"],"Steam Sailor":["Queso Geyser"],"Emberstone Scaled":["Queso Geyser"],"Bitter Root":["Fungal Cavern"],"Cavern Crumbler":["Fungal Cavern"],"Crag Elder":["Fungal Cavern"],"Crystal Behemoth":["Fungal Cavern"],"Crystal Cave Worm":["Fungal Cavern"],"Crystal Controller":["Fungal Cavern"],"Crystal Golem":["Fungal Cavern"],"Crystal Lurker":["Fungal Cavern"],"Crystal Observer":["Fungal Cavern"],"Crystal Queen":["Fungal Cavern"],"Crystalback":["Fungal Cavern"],"Crystalline Slasher":["Fungal Cavern"],"Diamondhide":["Fungal Cavern"],"Dirt Thing":["Fungal Cavern"],"Floating Spore":["Fungal Cavern"],"Funglore":["Fungal Cavern"],"Gemorpher":["Fungal Cavern"],"Gemstone Worshipper":["Fungal Cavern"],"Huntereater":["Fungal Cavern"],"Lumahead":["Fungal Cavern"],"Mouldy Mole":["Fungal Cavern"],"Mush":["Fungal Cavern"],"Mushroom Sprite":["Fungal Cavern"],"Nightshade Masquerade":["Fungal Cavern"],"Quillback":["Fungal Cavern"],"Shattered Obsidian":["Fungal Cavern"],"Spiked Burrower":["Fungal Cavern"],"Splintered Stone Sentry":["Fungal Cavern"],"Spore Muncher":["Fungal Cavern"],"Sporeticus":["Fungal Cavern"],"Stalagmite":["Fungal Cavern"],"Stone Maiden":["Fungal Cavern"],"Ash Golem":["Labyrinth","Zokor"],"Automated Stone Sentry":["Labyrinth","Zokor"],"Corridor Bruiser":["Labyrinth","Zokor"],"Dark Templar":["Labyrinth","Zokor"],"Drudge":["Labyrinth","Zokor"],"Fungal Technomorph":["Labyrinth","Zokor"],"Hired Eidolon":["Labyrinth","Zokor"],"Lost":["Labyrinth"],"Lost Legionnaire":["Labyrinth"],"Masked Pikeman":["Labyrinth","Zokor"],"Mimic":["Labyrinth","Zokor"],"Mind Tearer":["Labyrinth","Zokor"],"Shadow Stalker":["Labyrinth","Zokor"],"Mush Monster":["Labyrinth","Zokor"],"Mushroom Harvester":["Labyrinth","Zokor"],"Mystic Guardian":["Labyrinth","Zokor"],"Mystic Herald":["Labyrinth","Zokor"],"Mystic Scholar":["Labyrinth","Zokor"],"Nightshade Nanny":["Labyrinth","Zokor"],"Reanimated Carver":["Labyrinth","Zokor"],"RR-8":["Labyrinth","Zokor"],"Sanguinarian":["Labyrinth","Zokor"],"Solemn Soldier":["Labyrinth","Zokor"],"Summoning Scholar":["Labyrinth","Zokor"],"Tech Golem":["Labyrinth","Zokor"],"Treasure Brawler":["Labyrinth","Zokor"],"Ancient Scribe":["Zokor"],"Battle Cleric":["Zokor"],"Decrepit Tentacle Terror":["Zokor"],"Ethereal Guardian":["Zokor"],"Exo-Tech":["Zokor"],"Sir Fleekio":["Zokor"],"Manaforge Smith":["Zokor"],"Paladin Weapon Master":["Zokor"],"Matron of Machinery":["Zokor"],"Matron of Wealth":["Zokor"],"Molten Midas":["Zokor"],"Nightshade Fungalmancer":["Zokor"],"Retired Minotaur":["Zokor"],"Soul Binder":["Zokor"],"Madame d'Ormouse":["Zokor","Table of Contents"],"Charming Chimer":["Moussu Picchu"],"Cloud Collector":["Moussu Picchu"],"Cycloness":["Moussu Picchu"],"Dragoon":["Moussu Picchu"],"Fluttering Flutist":["Moussu Picchu"],"Ful'Mina the Mountain Queen":["Moussu Picchu"],"Homeopathic Apothecary":["Moussu Picchu"],"Monsoon Maker":["Moussu Picchu"],"Nightshade Flower Girl":["Moussu Picchu"],"Nightshade Maiden":["Moussu Picchu"],"Rain Collector":["Moussu Picchu"],"Rainwater Purifier":["Moussu Picchu"],"Rain Wallower":["Moussu Picchu"],"Rainmancer":["Moussu Picchu"],"Spore Salesman":["Moussu Picchu"],"Rain Summoner":["Moussu Picchu"],"Thundering Watcher":["Moussu Picchu"],"⚡Thunderlord⚡":["Moussu Picchu"],"Thunder Strike":["Moussu Picchu"],"Violet Stormchild":["Moussu Picchu"],"Breeze Borrower":["Moussu Picchu"],"Windy Farmer":["Moussu Picchu"],"Wind Warrior":["Moussu Picchu"],"Wind Watcher":["Moussu Picchu"],"Bitter Grammarian":["Moussu Picchu","Table of Contents"],"Admiral Cloudbeard":["Floating Islands"],"Agent M":["Floating Islands"],"Paragon of Arcane":["Floating Islands"],"Astrological Astronomer":["Floating Islands"],"Captain Cloudkicker":["Floating Islands"],"Cloud Miner":["Floating Islands"],"Cumulost":["Floating Islands"],"Cute Cloud Conjurer":["Floating Islands"],"Cutthroat Cannoneer":["Floating Islands"],"Cutthroat Pirate":["Floating Islands"],"Daydreamer":["Floating Islands"],"Devious Gentleman":["Floating Islands"],"Paragon of Dragons":["Floating Islands"],"Dragonbreather":["Floating Islands"],"Lancer Guard":["Floating Islands"],"Warden of Fog":["Floating Islands"],"Paragon of Forgotten":["Floating Islands"],"Warden of Frost":["Floating Islands"],"Ground Gavaleer":["Floating Islands"],"Gyrologer":["Floating Islands"],"Herc":["Floating Islands"],"Paragon of Water":["Floating Islands"],"Kite Flyer":["Floating Islands"],"Launchpad Labourer":["Floating Islands"],"Paragon of the Lawless":["Floating Islands"],"Lawbender":["Floating Islands"],"Mairitime Pirate":["Floating Islands"],"Mist Maker":["Floating Islands"],"Nimbomancer":["Floating Islands"],"Overcaster":["Floating Islands"],"Paragon of Strength":["Floating Islands"],"Warden of Rain":["Floating Islands"],"Regal Spearman":["Floating Islands"],"Richard the Rich":["Floating Islands"],"Scarlet Revenger":["Floating Islands"],"Seasoned Islandographer":["Floating Islands"],"Paragon of Shadow":["Floating Islands"],"Shadow Sage":["Floating Islands"],"Sky Dancer":["Floating Islands"],"Sky Glass Glazier":["Floating Islands"],"Sky Glass Sorcerer":["Floating Islands"],"Sky Greaser":["Floating Islands"],"Sky Highborne":["Floating Islands"],"Sky Squire":["Floating Islands"],"Sky Surfer":["Floating Islands"],"Sky Swordsman":["Floating Islands"],"Skydiver":["Floating Islands"],"Spheric Diviner":["Floating Islands"],"Spry Sky Explorer":["Floating Islands"],"Spry Sky Seer":["Floating Islands"],"Stack of Thieves":["Floating Islands"],"Stratocaster":["Floating Islands"],"Suave Pirate":["Floating Islands"],"Paragon of Tactics":["Floating Islands"],"Tiny Dragonfly":["Floating Islands"],"Warden of Wind":["Floating Islands"],"Worried Wayfinder":["Floating Islands"],"Sky Glider":["Floating Islands"],"Consumed Charm Tinkerer":["Floating Islands"],"Empyrean Geologist":["Floating Islands"],"Empyrean Javelineer":["Floating Islands"],"Forgotten Elder":["Floating Islands"],"Cloud Strider":["Floating Islands"],"Aristo-Cat Burglar":["Floating Islands"],"Fortuitous Fool":["Floating Islands"],"Empyrean Appraiser":["Floating Islands"],"Glamorous Gladiator":["Floating Islands"],"Peggy the Plunderer":["Floating Islands"],"Zealous Academic":["Floating Islands"],"Rocketeer":["Floating Islands"],"Empyrean Empress":["Floating Islands"],"Angry Aphid":["Foreword Farm"],"Crazed Cultivator":["Foreword Farm"],"Grit Grifter":["Foreword Farm"],"Land Loafer":["Foreword Farm"],"Loathsome Locust":["Foreword Farm"],"Mighty Mite":["Foreword Farm"],"Root Rummager":["Foreword Farm"],"Wily Weevil":["Foreword Farm"],"Monstrous Midge":["Foreword Farm"],"Architeuthulhu of the Abyss":["Prologue Pond"],"Beachcomber":["Prologue Pond"],"Careless Catfish":["Prologue Pond"],"Covetous Coastguard":["Prologue Pond"],"Melodramatic Minnow":["Prologue Pond"],"Nefarious Nautilus":["Prologue Pond"],"Pompous Perch":["Prologue Pond"],"Sand Sifter":["Prologue Pond"],"Sinister Squid":["Prologue Pond"],"Tackle Tracker":["Prologue Pond"],"Vicious Vampire Squid":["Prologue Pond"],"Fibbocchio":["Table of Contents"],"Flamboyant Flautist":["Table of Contents"],"Greenbeard":["Table of Contents"],"Humphrey Dumphrey":["Table of Contents"],"Ice Regent":["Table of Contents"],"Little Bo Squeak":["Table of Contents"],"Little Miss Fluffet":["Table of Contents"],"Pinkielina":["Table of Contents"],"Princess and the Olive":["Table of Contents"],"M1000":["Table of Contents"],"Baroness Von Bean":["Bountiful Beanstalk"],"Baroque Dancer":["Bountiful Beanstalk"],"Budrich Thornborn":["Bountiful Beanstalk"],"Cagey Countess":["Bountiful Beanstalk"],"Cell Sweeper":["Bountiful Beanstalk"],"Chafed Cellist":["Bountiful Beanstalk"],"Clumsy Cupbearer":["Bountiful Beanstalk"],"Dastardly Duchess":["Bountiful Beanstalk"],"Diminutive Detainee":["Bountiful Beanstalk"],"Dungeon Master":["Bountiful Beanstalk"],"Gate Keeper":["Bountiful Beanstalk"],"Jovial Jailor":["Bountiful Beanstalk"],"Key Master":["Bountiful Beanstalk"],"Leafton Beanwell":["Bountiful Beanstalk"],"Lethargic Guard":["Bountiful Beanstalk"],"Malevolent Maestro":["Bountiful Beanstalk"],"Malicious Marquis":["Bountiful Beanstalk"],"Mythical Giant King":["Bountiful Beanstalk"],"Obstinate Oboist":["Bountiful Beanstalk"],"Peaceful Prisoner":["Bountiful Beanstalk"],"Peevish Piccoloist":["Bountiful Beanstalk"],"Pernicious Prince":["Bountiful Beanstalk"],"Plotting Page":["Bountiful Beanstalk"],"Sassy Salsa Dancer":["Bountiful Beanstalk"],"Scheming Squire":["Bountiful Beanstalk"],"Smug Smuggler":["Bountiful Beanstalk"],"Sultry Saxophonist":["Bountiful Beanstalk"],"Treacherous Tubaist":["Bountiful Beanstalk"],"Vindictive Viscount":["Bountiful Beanstalk"],"Vinneus Stalkhome":["Bountiful Beanstalk"],"Violent Violinist":["Bountiful Beanstalk"],"Whimsical Waltzer":["Bountiful Beanstalk"],"Wrathful Warden":["Bountiful Beanstalk"],"Herbaceous Bravestalk":["Bountiful Beanstalk"],"Arcana Overachiever":["School of Sorcery"],"Arcane Master Sorcerer":["School of Sorcery"],"Audacious Alchemist":["School of Sorcery"],"Bookworm":["School of Sorcery"],"Broomstick Bungler":["School of Sorcery"],"Celestial Summoner":["School of Sorcery"],"Cheat Sheet Conjurer":["School of Sorcery"],"Class Clown":["School of Sorcery"],"Classroom Disrupter":["School of Sorcery"],"Classroom Keener":["School of Sorcery"],"Constructively Critical Artist":["School of Sorcery"],"Data Devourer":["School of Sorcery"],"Enchanted Chess Club Champion":["School of Sorcery"],"Featherlight":["School of Sorcery"],"Hall Monitor":["School of Sorcery"],"Illustrious Illusionist":["School of Sorcery"],"Invisible Fashionista":["School of Sorcery"],"Magical Multitasker":["School of Sorcery"],"Misfortune Teller":["School of Sorcery"],"Mixing Mishap":["School of Sorcery"],"Mythical Master Sorcerer":["School of Sorcery"],"Perpetual Detention":["School of Sorcery"],"Prestigious Prestidigitator":["School of Sorcery"],"Shadow Master Sorcerer":["School of Sorcery"],"Sleep Starved Scholar":["School of Sorcery"],"Teleporting Truant":["School of Sorcery"],"Tyrannical Thaumaturge":["School of Sorcery"],"Uncoordinated Cauldron Carrier":["School of Sorcery"],"Crematio Scorchworth":["Draconic Depths"],"Malignus Vilestrom":["Draconic Depths"],"Rimeus Polarblast":["Draconic Depths"],"Absolutia Harmonius":["Draconic Depths"],"Arcticus the Biting Frost":["Draconic Depths"],"Avalancheus the Glacial":["Draconic Depths"],"Belchazar Banewright":["Draconic Depths"],"Blizzara Winterosa":["Draconic Depths"],"Chillandria Permafrost":["Draconic Depths"],"Colonel Crisp":["Draconic Depths"],"Combustius Furnaceheart":["Draconic Depths"],"Corrupticus the Blight Baron":["Draconic Depths"],"Dreck Grimehaven":["Draconic Depths"],"Flamina Cinderbreath":["Draconic Depths"],"Frigidocius Coldshot":["Draconic Depths"],"Frostnip Icebound":["Draconic Depths"],"Goopus Dredgemore":["Draconic Depths"],"Iciclesius the Defender":["Draconic Depths"],"Incendarius the Unquenchable":["Draconic Depths"],"Magnatius Majestica":["Draconic Depths"],"Mythical Dragon Emperor":["Draconic Depths"],"Noxio Sludgewell":["Draconic Depths"],"Pestilentia the Putrid":["Draconic Depths"],"Squire Sizzleton":["Draconic Depths"],"Sulfurious the Raging Inferno":["Draconic Depths"],"Supremia Magnificus":["Draconic Depths"],"Three'amat the Mother of Dragons":["Draconic Depths"],"Torchbearer Tinderhelm":["Draconic Depths"],"Tranquilia Protecticus":["Draconic Depths"],"Venomona Festerbloom":["Draconic Depths"],"Cyborg":["Gnawnia Rift"],"Riftweaver":["Gnawnia Rift"],"Agitated Gentle Giant":["Gnawnia Rift"],"Raw Diamond":["Gnawnia Rift","Furoma Rift"],"Rift Guardian":["Gnawnia Rift","Furoma Rift"],"Goliath Field":["Gnawnia Rift"],"Dream Drifter":["Gnawnia Rift"],"Wealth":["Gnawnia Rift","Furoma Rift"],"Shard Centurion":["Gnawnia Rift"],"Greyrun":["Gnawnia Rift"],"Excitable Electric":["Gnawnia Rift"],"Mighty Mole":["Gnawnia Rift"],"Supernatural":["Gnawnia Rift"],"Spiritual Steel":["Gnawnia Rift"],"Micro":["Gnawnia Rift"],"Brawny":["Gnawnia Rift","Furoma Rift"],"Amplified Brown":["Burroughs Rift"],"Amplified Grey":["Burroughs Rift"],"Amplified White":["Burroughs Rift"],"Assassin Beast":["Burroughs Rift"],"Automated Sentry":["Burroughs Rift"],"Big Bad Behemoth Burroughs":["Burroughs Rift"],"Rift Bio Engineer":["Burroughs Rift"],"Boulder Biter":["Burroughs Rift"],"Clump":["Burroughs Rift"],"Count Vampire":["Burroughs Rift"],"Cyber Miner":["Burroughs Rift"],"Cybernetic Specialist":["Burroughs Rift"],"Doktor":["Burroughs Rift"],"Evil Scientist":["Burroughs Rift"],"Itty Bitty Rifty Burroughs":["Burroughs Rift"],"Lambent":["Burroughs Rift"],"Lycanoid":["Burroughs Rift"],"Master Exploder":["Burroughs Rift"],"Mecha Tail":["Burroughs Rift"],"Menace of the Rift":["Burroughs Rift"],"Monstrous Abomination":["Burroughs Rift"],"Phase Zombie":["Burroughs Rift"],"Plutonium Tentacle":["Burroughs Rift"],"Pneumatic Dirt Displacement":["Burroughs Rift"],"Portable Generator":["Burroughs Rift"],"Prototype":["Burroughs Rift"],"Super Mega Mecha Ultra RoboGold":["Burroughs Rift"],"Rancid Bog Beast":["Burroughs Rift"],"Revenant":["Burroughs Rift"],"Rifterranian":["Burroughs Rift"],"Robat":["Burroughs Rift"],"Radioactive Ooze":["Burroughs Rift"],"Surgeon Bot":["Burroughs Rift"],"Tech Ravenous Zombie":["Burroughs Rift"],"Toxic Avenger":["Burroughs Rift"],"Toxikinetic":["Burroughs Rift"],"Zombot Unipire the Third":["Burroughs Rift"],"Red Coat Bear":["Whisker Woods Rift"],"Monstrous Black Widow":["Whisker Woods Rift"],"Centaur Ranger":["Whisker Woods Rift"],"Karmachameleon":["Whisker Woods Rift"],"Cherry Sprite":["Whisker Woods Rift"],"Naturalist":["Whisker Woods Rift"],"Cyclops Barbarian":["Whisker Woods Rift"],"Red-Eyed Watcher Owl":["Whisker Woods Rift"],"Treant Queen":["Whisker Woods Rift"],"Spirit of Balance":["Whisker Woods Rift"],"Spirit Fox":["Whisker Woods Rift"],"Fungal Frog":["Whisker Woods Rift"],"Crazed Goblin":["Whisker Woods Rift"],"Gilded Leaf":["Whisker Woods Rift"],"Winged Harpy":["Whisker Woods Rift"],"Tri-dra":["Whisker Woods Rift"],"Mossy Moosker":["Whisker Woods Rift"],"Nomadic Warrior":["Whisker Woods Rift"],"Medicine":["Whisker Woods Rift"],"Grizzled Silth":["Whisker Woods Rift"],"Bloomed Sylvan":["Whisker Woods Rift"],"Rift Tiger":["Whisker Woods Rift"],"Twisted Treant":["Whisker Woods Rift"],"Tree Troll":["Whisker Woods Rift"],"Water Sprite":["Whisker Woods Rift"],"Cranky Caterpillar":["Whisker Woods Rift"],"Armored Archer":["Furoma Rift"],"Dancing Assassin":["Furoma Rift"],"Master of the Chi Belt":["Furoma Rift"],"Student of the Chi Belt":["Furoma Rift"],"Master of the Chi Claw":["Furoma Rift"],"Student of the Chi Claw":["Furoma Rift"],"Grand Master of the Dojo":["Furoma Rift"],"Supreme Sensei":["Furoma Rift"],"Dumpling Delivery":["Furoma Rift"],"Master of the Chi Fang":["Furoma Rift"],"Student of the Chi Fang":["Furoma Rift"],"Ascended Elder":["Furoma Rift"],"Shaolin Kung Fu":["Furoma Rift"],"Wandering Monk":["Furoma Rift"],"Shinobi":["Furoma Rift"],"Militant Samurai":["Furoma Rift"],"Enlightened Labourer":["Furoma Rift"],"Absolute Acolyte":["Bristle Woods Rift"],"Chronomaster":["Bristle Woods Rift"],"Vigilant Ward":["Bristle Woods Rift"],"Portal Paladin":["Bristle Woods Rift"],"Epoch Golem":["Bristle Woods Rift"],"Timeslither Pythoness":["Bristle Woods Rift"],"Record Keeper":["Bristle Woods Rift"],"Record Keeper's Assistant":["Bristle Woods Rift"],"Timeless Lich":["Bristle Woods Rift"],"Sentient Slime":["Bristle Woods Rift"],"Chamber Cleaver":["Bristle Woods Rift"],"Harbinger of Death":["Bristle Woods Rift"],"Portal Plunderer":["Bristle Woods Rift"],"Skeletal Champion":["Bristle Woods Rift"],"Timelost Thaumaturge":["Bristle Woods Rift"],"Shackled Servant":["Bristle Woods Rift"],"Clockwork Timespinner":["Bristle Woods Rift"],"Portal Pursuer":["Bristle Woods Rift"],"Dread Knight":["Bristle Woods Rift"],"Carrion Medium":["Bristle Woods Rift"],"One-Mouse Band":["Valour Rift"],"Champion Danseuse":["Valour Rift"],"Withered Remains":["Valour Rift"],"Arch Champion Necromancer":["Valour Rift"],"Shade of the Eclipse":["Valour Rift"],"Timid Explorer":["Valour Rift"],"Elixir Maker":["Valour Rift"],"The Total Eclipse":["Valour Rift"],"Unwavering Adventurer":["Valour Rift"],"Lumi-lancer":["Valour Rift"],"Berzerker":["Valour Rift"],"Mouse of Elements":["Valour Rift"],"Magic Champion":["Valour Rift"],"Martial":["Valour Rift"],"Praetorian Champion":["Valour Rift"],"Bulwark of Ascent":["Valour Rift"],"Cursed Crusader":["Valour Rift"],"Fallen Champion Footman":["Valour Rift"],"Soldier of the Shade":["Valour Rift"],"Possessed Armaments":["Valour Rift"],"Prestigious Adventurer":["Valour Rift"],"Puppetto":["Valour Rift"],"Puppet Champion":["Valour Rift"],"Terrified Adventurer":["Valour Rift"],"Cutpurse":["Valour Rift"],"Champion Thief":["Valour Rift"]}

  const fetchMouseDataAndUpdateUI = async () => {
    if (!dom.miceLst) {
      console.error("Error: dom.miceLst not initialized! UI create failed.");
      return;
    }
    dom.miceLst.textContent = "Loading env and mouse data...";

    await fetchEnvironmentsData(); // Ensure environments data is fetched and stored

    try {
      const allMiceStats = await getHuntingStatsPromise();
      if (!allMiceStats) {
        dom.miceLst.textContent = "Error loading mouse data.";
        return;
      }

      let allMiceData = [];
      const currentEnvId = user.environment_type;

      for (const item of allMiceStats) {
        const mouseName = correctMouseName(item.name);
        const locations = mouseLocationsData[mouseName] || ["Unknown Location"];

        const environmentDetails = locations.map(locationName => {
          const env = environments.find(env => env.name === locationName);
          return env ? {
            environmentId: env.id,
            environmentName: env.name,
            region: env.region
          } : {
            environmentId: "unknown_env_id",
            environmentName: locationName,
            region: "Unknown Region" // Default region if not found in API
          };
        });

        locations.forEach((locationName, index) => {
          const envDetails = environmentDetails[index];

          allMiceData.push({
            name: mouseName,
            catches: item.num_catches,
            misses: item.num_misses,
            environmentId: envDetails.environmentId,
            environmentName: envDetails.environmentName,
            region: envDetails.region,
            locationGroup: `${envDetails.environmentName}` // Still use location name for location grouping
          });
        });
      }

      md = allMiceData;
      updateUI();
    } catch (error) {
      console.error("Error fetching mouse data:", error);
      if (dom.miceLst) {
        dom.miceLst.textContent = "Error loading mouse data.";
      } else {
        console.warn("miceLst not found when displaying mouse data error.");
      }
    }
  };

  // --- Group Collapsing Logic ---
  const toggleRegionCollapse = (regionGroup) => { // For region group collapse
	  regionGroup.isCollapsed = !regionGroup.isCollapsed;
	  GM_setValue('mhTracker_regionCollapse_' + regionGroup.groupName, regionGroup.isCollapsed); // Save region collapse state
	  updateRegionUI(regionGroup);
  };

  const toggleLocationCollapse = (locationGroup) => { // New for location group collapse
	  locationGroup.isCollapsed = !locationGroup.isCollapsed;
	  GM_setValue('mhTracker_locationCollapse_' + locationGroup.groupName, locationGroup.isCollapsed); // Save location collapse state
	  updateLocationUI(locationGroup);
  };

  const updateRegionUI = (regionGroup) => { // For region UI update
    const regionHeader = findRegionHeaderElement(regionGroup.groupName);
    const regionMiceCont = findRegionMiceContainerElement(regionGroup.groupName);

    if (regionHeader && regionMiceCont) {
      const collapseIcon = regionHeader.querySelector('.mh-group-collapse-icon_v2');
      collapseIcon.textContent = regionGroup.isCollapsed ? '+' : '-';
      regionMiceCont.style.display = regionGroup.isCollapsed ? 'none' : 'block';
    }
  };

  const updateLocationUI = (locationGroup) => { // New for location UI update
    const locationHeader = findLocationHeaderElement(locationGroup.groupName);
    const locationMiceCont = findLocationMiceContainerElement(locationGroup.groupName);

    if (locationHeader && locationMiceCont) {
      const collapseIcon = locationHeader.querySelector('.mh-location-collapse-icon_v2');
      collapseIcon.textContent = locationGroup.isCollapsed ? '+' : '-';
      locationMiceCont.style.display = locationGroup.isCollapsed ? 'none' : 'block';
    }
  };


  const findRegionHeaderElement = (regionName) => { // Find region header
    const headers = dom.miceLst.querySelectorAll('.mh-group-header-row_v2');
    for (const header of headers) {
      if (header.querySelector('.mh-group-title_v2').textContent === regionName) {
        return header;
      }
    }
    return null;
  };

  const findRegionMiceContainerElement = (regionName) => { // Find region container
    const containers = dom.miceLst.querySelectorAll('.mh-group-mice-container_v2');
    for (const container of containers) {
      if (container.previousElementSibling && container.previousElementSibling.querySelector('.mh-group-title_v2').textContent === regionName) {
        return container;
      }
    }
    return null;
  };

  const findLocationHeaderElement = (locationName) => { // New: Find location header
    const headers = dom.miceLst.querySelectorAll('.mh-location-header-row_v2');
    for (const header of headers) {
      if (header.querySelector('.mh-location-title_v2').textContent === locationName) {
        return header;
      }
    }
    return null;
  };

  const findLocationMiceContainerElement = (locationName) => { // New: Find location container
    const containers = dom.miceLst.querySelectorAll('.mh-location-mice-container_v2');
    for (const container of containers) {
      if (container.previousElementSibling && container.previousElementSibling.querySelector('.mh-location-title_v2').textContent === locationName) {
        return container;
      }
    }
    return null;
  };


  // --- Tracker Start/Reset Logic ---
  function startTracker() {
    const hasStartedBefore = GM_getValue('mhTrackerFirstStart_v2', false);
    if (!hasStartedBefore) {
      dom.trackerCont.style.height = '300px';
      GM_setValue('mhTrackerHeight_v2', '300px');
      GM_setValue('mhTrackerFirstStart_v2', true);
    }

    if (ts.startTime) {
      if (window.confirm("Reset tracker? All data deleted.")) {
        resetTracker();
      }
    } else {
      startNewTrackingSession();
    }
  }

  const startNewTrackingSession = async () => {
    try {
      await fetchEnvironmentsData(); // Ensure environments data is fetched

      let allInitialMouseData = [];
      const initialAllMiceStats = await getHuntingStatsPromise();

      if (initialAllMiceStats) {
        for (const item of initialAllMiceStats) {
          const mouseName = correctMouseName(item.name);
          const initialMouseEntry = {
            name: mouseName,
            catches: item.num_catches,
            misses: item.num_misses
          };
          allInitialMouseData.push(initialMouseEntry);
        }
      }

      ts.initialMouseData = JSON.parse(JSON.stringify(allInitialMouseData));
      ts.startTime = Date.now();
      ts.lifetimeHuntsAtStart = calculateTotalHunts();

      localStorage.setItem('mhMouseTrackerState_v2', JSON.stringify(ts));

      dom.startBtn.textContent = formatStartTimeButtonText(ts.startTime);
      dom.startBtn.style.color = '#888';
      updateUI();
    } catch (error) {
      console.error("Error starting tracker:", error);
      alert("Failed to start tracker. Check console.");
    }
  };

  function resetTracker() {
    ts = {};
    localStorage.removeItem('mhMouseTrackerState_v2');

    dom.startBtn.textContent = 'Start Tracker';
    dom.startBtn.style.color = '';
    dom.miceLst.innerHTML = `
      <div id="mh-mouse-list-header-row_v2">
        <span class="mh-header-name-col_v2">Mouse</span>
        <span class="mh-header-cm-col_v2">C/M</span>
      </div>
      Tracker Reset. Click "Start Tracker" to begin.
    `;
    dom.huntsCountDisplay.textContent = 'Hunts: 0';
    fetchMouseDataAndUpdateUI();
  }

  // --- Initialization ---
  async function initializeTracker() { // Make initializeTracker async
    createUI();
    if (!dom.startBtn) {
      console.error("Error: dom.startBtn not initialized! UI create fail.");
      return;
    }
    await fetchEnvironmentsData(); // Fetch environments data on initialization
    fetchMouseDataAndUpdateUI();

    const storedTrackerState = localStorage.getItem('mhMouseTrackerState_v2');
    if (storedTrackerState) {
      ts = JSON.parse(storedTrackerState);
      if (ts.startTime) {
        dom.startBtn.textContent = formatStartTimeButtonText(ts.startTime);
        dom.startBtn.style.color = '#888';
      }
    }
    updateUI();
  }


  initializeTracker();

})();

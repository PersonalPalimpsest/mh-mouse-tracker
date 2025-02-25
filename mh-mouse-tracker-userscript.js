// ==UserScript==
// @name         MouseHunt Mouse Tracker
// @namespace    http://tampermonkey.net/
// @version      0.8.36
// @description  Tracks mice caught in MouseHunt (reworked grouping)
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
  #mh-tracker-export-button_v2 {background: none; color: #e0e0e0; border: none; font-size: 1em; cursor: pointer; opacity: 0.6; transition: opacity 0.3s ease; margin-left: 10px; position: relative; top: -3px;}
  #mh-tracker-export-button_v2:hover {opacity: 1;}
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
  #mh-mouse-list_v2 {display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; margin-top: 5px; min-height: 10px; flex-grow: 1; max-height: 95vh; scrollbar-width: thin; scrollbar-color: #555555 #2a2a2a; height: 100%;} /* Added height: auto; */
  #mh-mouse-list-header-row_v2 {display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; white-space: nowrap; overflow: hidden; min-height: 25px; text-overflow: ellipsis; min-height: 30px;}
  #mh-mouse-list_v2 div {display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; white-space: nowrap; overflow-y: hidden; text-overflow: ellipsis;}
  #mh-mouse-list_v2 #mh-mouse-list-header-row_v2 {background-color: #000; font-weight: bold; padding: 0px 6px; margin: 0;} /* Padding and margin removed */
  #mh-mouse-list_v2 div {background-color: #3d3d3d; margin-bottom: 0px; transition: background-color 0.3s ease;} /* Reduced padding */
  #mh-mouse-list_v2 div:nth-child(odd) {background-color: #333333;}
  #mh-mouse-list_v2 div:hover {background-color: #555555;}
  #mh-mouse-list_v2 div[style*="color: lightgreen"] {color: lightgreen;}
  /**/
  .mh-mouse-name-col_v2 {text-align: left; padding: 4px 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mh-header-name-col_v2 {text-align: left; padding: 4px 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
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
  .mh-location-header-row_v2 {background-color: #4a4a4a; color: #e8e8e8; font-weight: bold; padding: 5px 6px; margin-top: 0px; margin-bottom: 0px; min_height: 25px; border-radius: 3px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;}
  .mh-location-header-row_v2:hover {background-color: #5a5a5a;}
  .mh-location-title_v2 {flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.95em;}
  .mh-location-collapse-icon_v2 {width: 12px; height: 12px; text-align: center; line-height: 12px; margin-left: 8px; font-size: 0.9em; opacity: 0.6; transition: opacity 0.3s ease;}
  .mh-location-header-row_v2:hover .mh-location-collapse-icon_v2 {opacity: 1;}
  .mh-location-mice-container_v2 {padding: 0px; margin-left: 0px; overflow-y: scroll; min-height: 25px; }
  #mh-mouse-list_v2 div{overflow-y: auto;}
  #mh-back-button-container {margin-bottom: 5px;padding: 0 6px; min-height: 20px;}
  #mh-back-button_v2 {background-color: #4a4a4a;color: #e0e0e0;border: none;border-radius: 4px;padding: 4px 10px;font-size: 0.9em;cursor: pointer;transition: background-color 0.3s ease;display: flex;align-items: center;gap: 5px;width: fit-content;}
  #mh-back-button_v2:hover {background-color: #5a5a5a;}
  #mh-back-button-container {
  margin-bottom: 5px;
  padding: 0 6px;}

#mh-navigation-row_v2 {
  display: flex;
  align-items: center;
  gap: 10px;
}

#mh-back-button_v2 {
  background-color: #4a4a4a;
  color: #e0e0e0;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
}

#mh-back-button_v2:hover {
  background-color: #5a5a5a;
}

#mh-current-location_v2 {
  color: #e0e0e0;
  font-size: 0.95em;
  font-weight: bold;
}
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
  let navigationStack = [];
  let currentView = 'root';
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

    //export button
    const exportButton = document.createElement('button');
    exportButton.textContent = "Export Data";
    exportButton.id = 'mh-trakcer-export-button_v2'
    exportButton.addEventListener('click', copyMouseDataToClipboard);

    titleElement.appendChild(exportButton)
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

  const createMouseList = () => {
    const miceLst = document.createElement('div');
    miceLst.id = 'mh-mouse-list_v2';
    const backButtonContainer = document.createElement('div');
    backButtonContainer.id = 'mh-back-button-container';
    const navigationRow = document.createElement('div');
    navigationRow.id = 'mh-navigation-row_v2';
    
    const backButton = document.createElement('button');
    backButton.id = 'mh-back-button_v2';
    backButton.innerHTML = '&larr; Back';
    backButton.onclick = handleBackNavigation;
    
    const currentLocation = document.createElement('span');
    currentLocation.id = 'mh-current-location_v2';
    // Show the current view name if not at root
    currentLocation.textContent = currentView !== 'root' ? currentView : '';
    
    navigationRow.appendChild(backButton);
    navigationRow.appendChild(currentLocation);
    backButtonContainer.appendChild(navigationRow);
    backButtonContainer.style.display = navigationStack.length > 0 ? 'block' : 'none';

    const headerRow = document.createElement('div');
    headerRow.id = 'mh-mouse-list-header-row_v2';
    headerRow.innerHTML = `
      <span class="mh-header-name-col_v2">Mouse</span>
      <span class="mh-header-cm-col_v2">C/M</span>
    `;
    
    miceLst.appendChild(backButtonContainer);
    miceLst.appendChild(headerRow);
    miceLst.appendChild(document.createTextNode('Tracker Reset. Click "Start Tracker" to begin.'));
    
    return miceLst;
  };


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
  
  const calculateTotalHunts = () => {
    const uniqueNames = {};
    var hunts = 0;
    for (const mouse of md){
        if(!uniqueNames[mouse.name]){
            uniqueNames[mouse.name] = true;
            hunts += mouse.catches + mouse.misses;
        }
    }
    return hunts

  }
    // md.reduce((total, mouse) => total + mouse.catches + mouse.misses, 0);

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
        });
      }
      regionGroupArray.push({
        groupName: regionName,     // Region name as group name
        locations: locationGroupArray, // Array of location groups
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
  
    // Create back button container and navigation
    const backButtonContainer = document.createElement('div');
    backButtonContainer.id = 'mh-back-button-container';
    const navigationRow = document.createElement('div');
    navigationRow.id = 'mh-navigation-row_v2';
  
    const backButton = document.createElement('button');
    backButton.id = 'mh-back-button_v2';
    backButton.innerHTML = '&larr; Back';
    backButton.onclick = handleBackNavigation;
  
    const currentLocation = document.createElement('span');
    currentLocation.id = 'mh-current-location_v2';
    const headerRow = document.createElement('div');
    headerRow.id = 'mh-mouse-list-header-row_v2';

    switch(navigationStack.length){
      case 2:
        currentLocation.textContent = currentView;
        // Create header row
        headerRow.innerHTML = `
          <span class="mh-header-name-col_v2">Mouse</span>
          <span class="mh-header-cm-col_v2">C/M</span>
        `;        break;
      case 1:
        currentLocation.textContent = correctGroupName(currentView);
        // Create header row
        headerRow.innerHTML = `
        <span class="mh-header-name-col_v2">Mouse</span>
        <span class="mh-header-cm-col_v2">Completed</span>
      `;
        break;
      default:
        currentLocation.textContent = '';
        headerRow.innerHTML = `
        <span class="mh-header-name-col_v2">Mouse</span>
        <span class="mh-header-cm-col_v2">Completed</span>
      `;
    }



    navigationRow.appendChild(backButton);
    navigationRow.appendChild(currentLocation);
    backButtonContainer.appendChild(navigationRow);
    backButtonContainer.style.display = navigationStack.length > 0 ? 'block' : 'none';
    
    miceLst.appendChild(backButtonContainer);
    miceLst.appendChild(headerRow);
  
    if (!md || md.length === 0) {
      miceLst.appendChild(document.createTextNode("Loading mouse data..."));
      return;
    }
  
    const currentEnvId = user.environment_type;
    const groupedMouseData = groupMouseData(md, currentEnvId);
    const trackedHunts = calculateTotalHunts() - ts.lifetimeHuntsAtStart;
    dom.huntsCountDisplay.textContent = `Hunts: ${trackedHunts.toLocaleString()}`;
  
    if (currentView === 'root') {
      // Show only region headers
      groupedMouseData.forEach(regionGroup => {
        const regionHeaderRow = createGroupHeaderRow(regionGroup);
        miceLst.appendChild(regionHeaderRow);
      });
    } else {
      // Find current region or location
      const currentRegion = groupedMouseData.find(region => region.groupName === currentView);
      if (currentRegion) {
        // Show locations in this region
        currentRegion.locations.forEach(locationGroup => {
          const locationHeaderRow = createLocationHeaderRow(locationGroup);
          miceLst.appendChild(locationHeaderRow);
        });
      } else {
        // Must be a location view - find location and show its mice
        for (const region of groupedMouseData) {
          const location = region.locations.find(loc => loc.groupName === currentView);
          if (location) {
            const miceContainer = createLocationMiceContainer(location);
            // Show all mice content directly without collapse
            miceContainer.style.display = 'block';
            miceLst.appendChild(miceContainer);
            break;
          }
        }
      }
    }
  };

  const createGroupHeaderRow = (group) => {
    const headerRow = document.createElement('div');
    headerRow.className = 'mh-group-header-row_v2';
    headerRow.onclick = () => enterRegion(group);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'mh-group-title_v2';
    titleSpan.textContent = correctGroupName(group.groupName);

    // Use sets to ensure uniqueness for both counts.
    const uniqueMiceSet = new Set();
    const nonZeroMiceSet = new Set();
    group.locations.forEach(locationGroup => {
        locationGroup.mice.forEach(mouse => {
            uniqueMiceSet.add(mouse.name);
            const { sessionCatches } = calculateSessionCM(mouse, ts.initialMouseData || []);
            if (sessionCatches > 0) {
                nonZeroMiceSet.add(mouse.name);
            }
        });
    });

    const countSpan = document.createElement('span');
    countSpan.textContent = `${nonZeroMiceSet.size}/${uniqueMiceSet.size}`;

    headerRow.appendChild(titleSpan);
    headerRow.appendChild(countSpan);
    return headerRow;
    };


    const createLocationHeaderRow = (locationGroup) => {
        const headerRow = document.createElement('div');
        headerRow.className = 'mh-location-header-row_v2';
        headerRow.onclick = () => toggleLocationCollapse(locationGroup);
    
        const titleSpan = document.createElement('span');
        titleSpan.className = 'mh-location-title_v2';
        titleSpan.textContent = locationGroup.groupName;
    
        // Use sets to ensure uniqueness for both counts.
        const uniqueMiceSet = new Set();
        const nonZeroMiceSet = new Set();
        locationGroup.mice.forEach(mouse => {
            uniqueMiceSet.add(mouse.name);
            const { sessionCatches } = calculateSessionCM(mouse, ts.initialMouseData || []);
            if (sessionCatches > 0) {
                nonZeroMiceSet.add(mouse.name);
            }
        });
    
        const countSpan = document.createElement('span');
        countSpan.textContent = `${nonZeroMiceSet.size}/${uniqueMiceSet.size}`;
    
        headerRow.appendChild(titleSpan);
        headerRow.appendChild(countSpan);
        return headerRow;
    };

  const createLocationMiceContainer = (locationGroup) => { // New for location mouse containers
    const miceCont = document.createElement('div');
    miceCont.className = 'mh-location-mice-container_v2'; // New class
    // miceCont.style.display = locationGroup.isCollapsed ? 'none' : 'block';
    //miceCont.style.height = 'auto'; // Ensure dynamic height

    const sortedMouseData = sortMouseData(locationGroup.mice, ts.initialMouseData);

    sortedMouseData.forEach(mouse => {
      miceCont.appendChild(createMouseRow(mouse, ts.initialMouseData));
    });
    return miceCont;
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

  const handleBackNavigation = () => {
    if (navigationStack.length > 0) {
      navigationStack.pop(); 
      currentView = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : 'root';
      updateMouseListUI(); 
      saveNavigationState(); 
    }
  };

  async function copyMouseDataToClipboard() {
    console.log(ts.initialMouseData)
    let fullOutput = "";
    let unique_mice = await getAllMiceData();
    unique_mice.forEach(mouse => {
        fullOutput += createExportRow(mouse, ts.initialMouseData) + "\n";
    });

    navigator.clipboard.writeText(fullOutput)
        .then(() => console.log("Copied to clipboard:\n"))
        .catch(err => console.error("Failed to copy text: ", err));
  }

  function createExportRow(mouse, initialMouseData){
    const { sessionCatches, sessionMisses } = calculateSessionCM(mouse, initialMouseData);
    return `${mouse.name}\t${sessionCatches}\t${sessionMisses}`;
  }

  async function getAllMiceData(){
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

    return JSON.parse(JSON.stringify(allInitialMouseData));
  }
  const updateUI = () => {
    if (!dom.miceLst) {
      console.error("UI not initialized. Call createUI() first.");
      return;
    }
    updateMouseListUI();
  };

  // Hardcoded data (consider fetching this from API for regions in the future if needed)
  // Personal opinion: keep this hard-coded to avoid random goalpost changes mid-run
  
  let mouseLocationsData = {"Abominable Snow":["Mountain"],"Acolyte":["Acolyte Realm"],"Aged":["Cape Clawed"],"Alchemist":["Cape Clawed","Elub Shore"],"Alnilam":["Nerg Plains"],"Alnitak":["Elub Shore"],"Aquos":["King's Gauntlet"],"Archer":["Training Grounds","Dojo"],"Assassin":["Dojo"],"Balack the Banished":["Balack's Cove"],"Bandit":["King's Gauntlet"],"Bat":["Mousoleum","Town of Digby","Great Gnarled Tree","Catacombs","Forbidden Grove"],"Bear":["Calm Clearing","Great Gnarled Tree"],"Beast Tamer":["Nerg Plains"],"Berserker":["King's Gauntlet"],"Big Bad Burroughs":["Town of Digby"],"Bionic":["Meadow","Town of Gnawnia","Harbour","Mountain","Laboratory","Town of Digby","Bazaar"],"Birthday":["SUPER|brie+ Factory"],"Black Mage":["King's Gauntlet"],"Black Widow":["Ronza's Shoppe","King's Arms","Harbour","Mountain","Calm Clearing","Laboratory","Mousoleum","Town of Digby","Great Gnarled Tree","Lagoon","Training Grounds","Bazaar","Catacombs","Forbidden Grove","Acolyte Realm","Elub Shore","Nerg Plains","Derr Dunes"],"Bottled":["S.S. Huntington IV"],"Briegull":["S.S. Huntington IV"],"Brimstone":["Balack's Cove"],"Brown":["Meadow","Town of Gnawnia","King's Arms","Windmill","Harbour","Mountain"],"Buccaneer":["S.S. Huntington IV"],"Burglar":["Ronza's Shoppe","King's Arms","Tournament Hall","Harbour","Laboratory","Bazaar"],"Candy Cane":["Cinnamon Hill","Festive Comet"],"Captain":["S.S. Huntington IV"],"Caretaker":["Cape Clawed","Nerg Plains"],"Hapless Marionette":["King's Gauntlet"],"Cavalier":["King's Gauntlet"],"Centaur":["Great Gnarled Tree","Lagoon"],"Chameleon":["Calm Clearing","Great Gnarled Tree","Cape Clawed","Nerg Plains"],"Champion":["Elub Shore"],"Chitinous":["Jungle of Dread"],"Christmas Tree":["Golem Workshop","Festive Comet"],"Clockwork Samurai":["King's Gauntlet"],"Conjurer":["Nerg Plains"],"Conqueror":["Nerg Plains"],"Cook":["S.S. Huntington IV"],"Core Sample":["Town of Digby"],"Costumed Tiger":[],"Cowbell":["King's Gauntlet"],"Cupid":["Training Grounds"],"Curious Chemist":["Great Gnarled Tree"],"Cyclops":["Calm Clearing","Lagoon"],"Dancer":["King's Gauntlet"],"Davy Jones":["Balack's Cove"],"Defender":["Nerg Plains"],"Demolitions":["Town of Digby"],"Derr Chieftain":["Derr Dunes"],"Derr Lich":["Balack's Cove"],"Diamond":["Meadow","Town of Gnawnia","Ronza's Shoppe","King's Arms","Tournament Hall","Windmill","Harbour","Mountain","Town of Digby","Training Grounds","Dojo"],"Dojo Sensei":["Pinnacle Chamber"],"Draconic Warden":["Dracano"],"Dragon":["Dracano"],"Drummer":["King's Gauntlet"],"Dumpling Chef":["Training Grounds"],"Dwarf":["Meadow","Town of Gnawnia","Ronza's Shoppe","King's Arms","Tournament Hall","Windmill","Harbour","Mountain","Calm Clearing","Town of Digby","Great Gnarled Tree","Training Grounds","Bazaar"],"Eagle Owl":["Ronza's Shoppe","Calm Clearing","Great Gnarled Tree","Lagoon"],"Eclipse":["King's Gauntlet"],"Elder":["Cape Clawed"],"Elf":["Golem Workshop","Festive Comet"],"Elub Chieftain":["Elub Shore"],"Elub Lich":["Balack's Cove"],"Elven Princess":["Ronza's Shoppe","Calm Clearing","Great Gnarled Tree","Lagoon"],"Enslaved Spirit":["Balack's Cove"],"Escape Artist":["King's Gauntlet"],"Fairy":["Great Gnarled Tree","Lagoon"],"Fencer":["King's Gauntlet"],"Fetid Swamp":["Jungle of Dread"],"Fiddler":["King's Gauntlet"],"Fiend":["King's Gauntlet"],"Finder":["Nerg Plains"],"Flying":["Meadow","Town of Gnawnia","Ronza's Shoppe","King's Arms","Tournament Hall","Windmill","Mountain"],"Foxy":["Calm Clearing","Great Gnarled Tree"],"Frog":["Calm Clearing","Great Gnarled Tree"],"Frosty Snow":["Mountain"],"Frozen":["Mountain"],"Gargoyle":["Forbidden Grove"],"Gate Guardian":["Forbidden Grove","Acolyte Realm"],"Ghost":["Mousoleum","Catacombs","Forbidden Grove"],"Giant Snail":["Mousoleum","Catacombs"],"Gladiator":["Derr Dunes"],"Glitchpaw":["Laboratory"],"Goblin":["Lagoon"],"Gold":["Meadow","Town of Gnawnia","Ronza's Shoppe","King's Arms","Tournament Hall","Windmill","Harbour","Mountain","Town of Digby","Training Grounds","Dojo"],"Golem":["Catacombs","Forbidden Grove","Acolyte Realm"],"Gorgon":["Forbidden Grove","Acolyte Realm"],"Grandfather":["Cape Clawed"],"Granite":["Meadow","Town of Gnawnia","Harbour","Mountain","Town of Digby","Bazaar"],"Grey":["Meadow","Town of Gnawnia","King's Arms","Windmill","Harbour","Mountain"],"Grunt":["Derr Dunes"],"Guardian":["Derr Dunes"],"Guqin Player":["King's Gauntlet"],"Hapless":["Dojo","Meditation Room","Pinnacle Chamber"],"Harpy":["Ronza's Shoppe","Lagoon"],"Healer":["Cape Clawed","Derr Dunes"],"Hollowhead":["Gloomy Greenwood"],"Hope":["Training Grounds","Bazaar"],"Hydra":["Lagoon","S.S. Huntington IV"],"Ignis":["King's Gauntlet"],"Impersonator":["King's Gauntlet"],"Industrious Digger":["Town of Digby"],"Itty-Bitty Burroughs":["Town of Digby"],"Rockstar":["Ronza's Shoppe"],"Jurassic":["Jungle of Dread"],"Keeper":["Catacombs"],"Keeper's Assistant":["Catacombs"],"Knight":["King's Gauntlet"],"Kung Fu":["Training Grounds","Dojo"],"Lambent Crystal":["Town of Digby"],"Leprechaun":[],"Leviathan":["S.S. Huntington IV"],"Lich":["Acolyte Realm"],"Lockpick":["King's Gauntlet"],"Longtail":["Town of Gnawnia","Ronza's Shoppe","King's Arms","Windmill"],"Lycan":["Mousoleum","Catacombs","Forbidden Grove"],"Magma Carrier":["Jungle of Dread"],"Master Burglar":["Town of Gnawnia","Bazaar"],"Master of the Cheese Belt":["Meditation Room"],"Master of the Cheese Claw":["Meditation Room"],"Master of the Cheese Fang":["Meditation Room"],"Master of the Dojo":["Pinnacle Chamber"],"Mermouse":["S.S. Huntington IV"],"Miner":["Town of Digby"],"Mintaka":["Derr Dunes"],"Mobster":[],"Mole":["Meadow","Windmill","Town of Digby"],"Monk":["Training Grounds","Dojo"],"Monster":["Laboratory","Mousoleum","Catacombs"],"Moosker":["Calm Clearing","Great Gnarled Tree"],"Mummy":["Mousoleum","Catacombs"],"Mutated Grey":["Laboratory","Bazaar","Forbidden Grove","Acolyte Realm"],"Mutated White":["Laboratory","Bazaar","Forbidden Grove","Acolyte Realm"],"Mystic":["Elub Shore"],"Narrator":["Cape Clawed","Nerg Plains"],"Necromancer":["King's Gauntlet"],"Nerg Chieftain":["Nerg Plains"],"Nerg Lich":["Balack's Cove"],"New Year's":["Ice Fortress","Festive Comet"],"Nibbler":["Town of Gnawnia","Ronza's Shoppe","King's Arms","Tournament Hall","Town of Digby","Great Gnarled Tree","Training Grounds","Bazaar","S.S. Huntington IV","Cape Clawed"],"Ninja":["Mountain","Training Grounds","Dojo"],"Nomad":["Ronza's Shoppe","Great Gnarled Tree","Lagoon"],"Nugget":["Town of Digby"],"Nutcracker":["Golem Workshop","Festive Comet"],"Ooze":["Catacombs"],"Ornament":["Golem Workshop","Festive Comet"],"Pack":["Elub Shore"],"Page":["King's Gauntlet"],"Paladin":["King's Gauntlet"],"Pathfinder":["Cape Clawed","Nerg Plains"],"Phalanx":["King's Gauntlet"],"Swarm of Pygmy Mice":["Jungle of Dread"],"Pinchy":["S.S. Huntington IV","Cape Clawed","Elub Shore"],"Pirate":["Harbour","S.S. Huntington IV"],"Present":["Golem Workshop","Festive Comet","SUPER|brie+ Factory"],"Primal":["Jungle of Dread"],"Protector":["Elub Shore"],"Puppet Master":["King's Gauntlet"],"Ravenous Zombie":["Mousoleum","Catacombs","Forbidden Grove"],"Reaper":["Forbidden Grove"],"Red Envelope":[],"Renegade":["Derr Dunes"],"Riptide":["Balack's Cove"],"Rock Muncher":["Town of Digby"],"Rogue":["King's Gauntlet"],"Romeno":["Town of Gnawnia"],"Romeo":["Town of Gnawnia"],"Sacred Shrine":["King's Gauntlet"],"Salt Water Snapper":["S.S. Huntington IV"],"Samurai":["Training Grounds","Dojo"],"Scavenger":["Catacombs","Forbidden Grove"],"Scout":["Cape Clawed","Elub Shore"],"Scrooge":["Golem Workshop","Festive Comet"],"Seer":["Derr Dunes"],"Shaman":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Shelder":["S.S. Huntington IV"],"Shipwrecked":["S.S. Huntington IV","Cape Clawed"],"Silth":["Lagoon"],"Siren":["S.S. Huntington IV"],"Skeleton":["Catacombs"],"Slayer":["Nerg Plains"],"Sock Puppet Ghost":["King's Gauntlet"],"Soothsayer":["Elub Shore"],"Sorcerer":["Forbidden Grove","Acolyte Realm"],"Spectre":["Forbidden Grove","Acolyte Realm"],"Spellbinder":["Derr Dunes"],"Spider":["Catacombs","Forbidden Grove"],"Squeaken":["S.S. Huntington IV"],"Stealth":["King's Gauntlet"],"Steel":["Meadow","Town of Gnawnia","Harbour","Mountain","Town of Digby","Bazaar"],"Stocking":["Golem Workshop","Festive Comet"],"Stone Cutter":["Town of Digby"],"Stonework Warrior":["Jungle of Dread"],"Student of the Cheese Belt":["Dojo"],"Student of the Cheese Claw":["Dojo"],"Student of the Cheese Fang":["Dojo"],"Subterranean":["Town of Digby"],"Swabbie":["S.S. Huntington IV"],"Sylvan":["Calm Clearing","Great Gnarled Tree","Cape Clawed","Derr Dunes"],"Taleweaver":["Cape Clawed","Elub Shore"],"Terra":["King's Gauntlet"],"Terrible Twos":["SUPER|brie+ Factory"],"Terror Knight":["Catacombs"],"Tiger":["Great Gnarled Tree","Lagoon"],"Toy":["Golem Workshop","Festive Comet"],"Toy Sylvan":["King's Gauntlet"],"Trailblazer":["Cape Clawed","Derr Dunes"],"Treant":["Calm Clearing","Great Gnarled Tree","Lagoon"],"Troll":["Lagoon"],"Twisted Fiend":["Balack's Cove"],"Vampire":["Mousoleum","Catacombs","Forbidden Grove"],"Vanquisher":["Elub Shore"],"Water Nymph":["Lagoon","S.S. Huntington IV"],"Whelpling":["Dracano"],"White":["Meadow","Town of Gnawnia","King's Arms","Windmill","Harbour","Mountain","Training Grounds"],"White Mage":["King's Gauntlet"],"Wicked Witch of Whisker Woods":["Great Gnarled Tree","Lagoon"],"Wiggler":["Calm Clearing","Great Gnarled Tree"],"Wight":["Acolyte Realm"],"Wordsmith":["Cape Clawed","Derr Dunes"],"Worker":["Training Grounds","Dojo"],"Wound Up White":["King's Gauntlet"],"Zephyr":["King's Gauntlet"],"Zombie":["Town of Gnawnia","Mountain","Mousoleum","Town of Digby","Bazaar","Catacombs","Forbidden Grove"],"Cowardly":["Meadow","Town of Gnawnia"],"Farmhand":["Windmill"],"Speedy":["Town of Gnawnia","King's Arms","Tournament Hall","Windmill"],"Field":["Meadow","Windmill"],"Fog":["Harbour","Mountain"],"Lightning Rod":["Meadow","Ronza's Shoppe","Tournament Hall"],"Magic":["Town of Gnawnia","King's Arms","Harbour"],"Pebble":["Mountain"],"Pugilist":["Town of Gnawnia","Ronza's Shoppe","King's Arms","Tournament Hall","Windmill","Harbour"],"Scruffy":["King's Arms","Windmill","Harbour"],"Silvertail":["Town of Gnawnia","Ronza's Shoppe","King's Arms","Tournament Hall","Windmill","Harbour","Mountain"],"Spud":["Windmill"],"Tiny":["Meadow","King's Arms","Windmill"],"Cherry":["Calm Clearing"],"Spotted":["Meadow","King's Arms","Harbour"],"Derpicorn":["Seasonal Garden"],"Fall Familiar":["Seasonal Garden"],"Firebreather":["Seasonal Garden"],"Firefly":["Seasonal Garden"],"Frostbite":["Seasonal Garden"],"Harvest Harrier":["Seasonal Garden"],"Harvester":["Seasonal Garden"],"Hot Head":["Seasonal Garden"],"Hydrophobe":["Seasonal Garden"],"Icicle":["Seasonal Garden"],"Monarch":["Seasonal Garden"],"Mystic Bishop":["Zugzwang's Tower"],"Mystic King":["Zugzwang's Tower"],"Mystic Knight":["Zugzwang's Tower"],"Mystic Pawn":["Zugzwang's Tower"],"Mystic Queen":["Zugzwang's Tower"],"Mystic Rook":["Zugzwang's Tower"],"Over-Prepared":["Seasonal Garden"],"Penguin":["Seasonal Garden"],"Puddlemancer":["Seasonal Garden"],"Pumpkin Head":["Seasonal Garden"],"Scarecrow":["Seasonal Garden"],"Spring Familiar":["Seasonal Garden"],"Stinger":["Seasonal Garden"],"Summer Mage":["Seasonal Garden"],"Tanglefoot":["Seasonal Garden"],"Technic Bishop":["Zugzwang's Tower"],"Technic King":["Zugzwang's Tower"],"Technic Knight":["Zugzwang's Tower"],"Technic Pawn":["Zugzwang's Tower"],"Technic Queen":["Zugzwang's Tower"],"Technic Rook":["Zugzwang's Tower"],"Vinetail":["Seasonal Garden"],"Whirleygig":["Seasonal Garden"],"Winter Mage":["Seasonal Garden"],"Bruticle":["Seasonal Garden"],"Chess Master":["Zugzwang's Tower"],"Realm Ripper":["Forbidden Grove"],"Tidal Fisher":["Balack's Cove"],"Gourdborg":["Gloomy Greenwood"],"Treat":["Gloomy Greenwood"],"Trick":["Gloomy Greenwood"],"Zombot Unipire":["Gloomy Greenwood","Mousoleum","Catacombs"],"High Roller":[],"Snooty":[],"Treasurer":[],"Missile Toe":["Ice Fortress","Festive Comet"],"Slay Ride":["Ice Fortress","Festive Comet"],"Snow Fort":["Ice Fortress","Festive Comet"],"Squeaker Claws":["Ice Fortress","Festive Comet"],"Wreath Thief":["Cinnamon Hill","Festive Comet"],"Mouse of Winter Future":["Golem Workshop","Festive Comet"],"Mouse of Winter Past":["Golem Workshop","Festive Comet"],"Mouse of Winter Present":["Golem Workshop","Festive Comet"],"Costumed Rabbit":[],"Juliyes":["Town of Gnawnia"],"Buckethead":["SUPER|brie+ Factory"],"Pintail":["SUPER|brie+ Factory"],"Sleepwalker":["SUPER|brie+ Factory"],"Flame Archer":["Fiery Warpath"],"Crimson Ranger":["Fiery Warpath"],"Desert Archer":["Fiery Warpath"],"Flame Ordnance":["Fiery Warpath"],"Gargantuamouse":["Fiery Warpath"],"Warmonger":["Fiery Warpath"],"Sand Cavalry":["Fiery Warpath"],"Sandwing Cavalry":["Fiery Warpath"],"Theurgy Warden":["Fiery Warpath"],"Crimson Commander":["Fiery Warpath"],"Inferno Mage":["Fiery Warpath"],"Magmarage":["Fiery Warpath"],"Sentinel":["Fiery Warpath"],"Crimson Watch":["Fiery Warpath"],"Vanguard":["Fiery Warpath"],"Caravan Guard":["Fiery Warpath"],"Flame Warrior":["Fiery Warpath"],"Crimson Titan":["Fiery Warpath"],"Desert Soldier":["Fiery Warpath"],"Coco Commander":[],"Egg Painter":[],"Eggsplosive Scientist":[],"Hare Razer":[],"Blacksmith":["Muridae Market"],"Lumberjack":["Muridae Market"],"Desert Nomad":["Muridae Market"],"Desert Architect":["Muridae Market"],"Falling Carpet":["Muridae Market"],"Glass Blower":["Muridae Market"],"Limestone Miner":["Muridae Market"],"Mage Weaver":["Muridae Market"],"Market Guard":["Muridae Market"],"Market Thief":["Muridae Market"],"Pie Thief":["Muridae Market"],"Snake Charmer":["Muridae Market"],"Spice Merchant":["Muridae Market"],"Grave Robber":["Gloomy Greenwood","Mousoleum","Catacombs"],"Aether":["Crystal Library"],"Bookborn":["Crystal Library"],"Effervescent":["Crystal Library"],"Explorator":["Crystal Library"],"Flutterby":["Crystal Library"],"Infiltrator":["Crystal Library"],"Zurreal the Eternal":["Crystal Library"],"Pocketwatch":["Crystal Library"],"Scribe":["Crystal Library"],"Steam Grip":["Crystal Library"],"Tome Sprite":["Crystal Library"],"Walker":["Crystal Library"],"Crown Collector":["King's Arms","Bazaar","S.S. Huntington IV","Crystal Library"],"Mousevina von Vermin":["Mousoleum"],"Cobweb":["Gloomy Greenwood"],"Pumpkin Hoarder":["Gloomy Greenwood"],"Destructoy":["Golem Workshop","Festive Comet"],"Snowflake":["Cinnamon Hill","Golem Workshop","Ice Fortress","Festive Comet"],"Snow Scavenger":["Cinnamon Hill","Festive Comet"],"Toy Tinkerer":["Golem Workshop","Festive Comet"],"Mad Elf":["Golem Workshop","Festive Comet"],"Party Head":["Golem Workshop","Festive Comet"],"Calligraphy":[],"Costumed Dragon":[],"Melancholy Merchant":["Bazaar"],"Pygmy Wrangler":["Jungle of Dread"],"Dinosuit":["SUPER|brie+ Factory"],"Eggscavator":[],"Sinister Egg Painter":[],"Incompetent Ice Climber":["Slushy Shoreline","Iceberg"],"Polar Bear":["Slushy Shoreline","Iceberg"],"Snow Soldier":["Slushy Shoreline","Iceberg"],"Wolfskie":["Iceberg"],"Chipper":["Slushy Shoreline","Iceberg"],"Snow Bowler":["Ronza's Shoppe","Slushy Shoreline","Iceberg"],"Snow Slinger":["Slushy Shoreline","Iceberg"],"Icebreaker":["Slushy Shoreline","Iceberg"],"Saboteur":["Slushy Shoreline","Iceberg"],"Snow Sniper":["Slushy Shoreline"],"Yeti":["Ronza's Shoppe","Slushy Shoreline","Iceberg"],"Living Ice":["Ronza's Shoppe","Slushy Shoreline"],"General Drheller":["Iceberg"],"Frostlance Guard":["Iceberg"],"Frostwing Commander":["Iceberg"],"Heavy Blaster":["Iceberg"],"Iceblade":["Iceberg"],"Iceblock":["Iceberg"],"Icewing":["Iceberg"],"Lady Coldsnap":["Iceberg"],"Lord Splodington":["Iceberg"],"Mammoth":["Ronza's Shoppe","Iceberg"],"Princess Fist":["Iceberg"],"Snowblind":["Iceberg"],"Stickybomber":["Iceberg"],"Water Wielder":["Iceberg"],"Living Salt":["Iceberg"],"Deep":["Iceberg"],"Lucky":["Ronza's Shoppe"],"Chrono":["Acolyte Realm"],"Hurdle":["Tournament Hall"],"Extreme Everysports":["Tournament Hall"],"Trampoline":["Tournament Hall"],"Goldleaf":["Ronza's Shoppe","Great Gnarled Tree"],"Relic Hunter":[],"Wild Chainsaw":["Gloomy Greenwood"],"Swamp Thang":["Gloomy Greenwood"],"Spirit Light":["Gloomy Greenwood"],"Bark":["Living Garden"],"Barkshell":["Living Garden"],"Calalilly":["Living Garden"],"Camoflower":["Living Garden"],"Camofusion":["Living Garden"],"Carmine the Apothecary":["Living Garden"],"Corrupt":["Lost City"],"Cursed":["Lost City"],"Cursed Enchanter":["Lost City"],"Cursed Engineer":["Lost City"],"Cursed Librarian":["Lost City"],"Cursed Thief":["Lost City"],"Dehydrated":["Living Garden"],"Dunehopper":["Sand Dunes"],"Essence Collector":["Lost City"],"Essence Guardian":["Lost City"],"Ethereal Enchanter":["Lost City"],"Ethereal Engineer":["Lost City"],"Ethereal Librarian":["Lost City"],"Ethereal Thief":["Lost City"],"Fungal Spore":["Living Garden"],"Grubling":["Sand Dunes"],"Grubling Herder":["Sand Dunes"],"King Grub":["Sand Dunes"],"Quesodillo":["Sand Dunes"],"Sand Colossus":["Sand Dunes"],"Sand Pilgrim":["Sand Dunes"],"Sarcophamouse":["Sand Dunes"],"Scarab":["Sand Dunes"],"Serpentine":["Sand Dunes"],"Shroom":["Living Garden"],"Spiky Devil":["Sand Dunes"],"Strawberry Hotcakes":["Living Garden"],"Thirsty":["Living Garden"],"Thistle":["Living Garden"],"Thorn":["Living Garden"],"Twisted Carmine":["Living Garden"],"Twisted Hotcakes":["Living Garden"],"Twisted Lilly":["Living Garden"],"Confused Courier":["Ice Fortress","Festive Comet"],"Gingerbread":["Golem Workshop","Festive Comet"],"Greedy Al":["Golem Workshop","Festive Comet"],"Ribbon":["Golem Workshop","Festive Comet"],"Ridiculous Sweater":["Golem Workshop","Festive Comet"],"Snowblower":["Ice Fortress","Festive Comet"],"Snowglobe":["Ice Fortress","Festive Comet"],"Triple Lutz":["Cinnamon Hill","Festive Comet"],"Dark Magi":["Lost City"],"King Scarab":["Sand Dunes"],"Shattered Carmine":["Living Garden"],"Costumed Snake":[],"Totally Not Tax Fraud":["Bazaar"],"Force Fighter Blue":["SUPER|brie+ Factory"],"Force Fighter Green":["SUPER|brie+ Factory"],"Force Fighter Pink":["SUPER|brie+ Factory"],"Force Fighter Red":["SUPER|brie+ Factory"],"Force Fighter Yellow":["SUPER|brie+ Factory"],"Super FighterBot MegaSupreme":["SUPER|brie+ Factory"],"Chocolate Overload":[],"Egg Scrambler":[],"Hardboiled":[],"Bartender":["Claw Shot City","Gnawnian Express Station"],"Bounty Hunter":["Claw Shot City"],"Cardshark":["Claw Shot City"],"Circuit Judge":["Claw Shot City"],"Coal Shoveller":["Claw Shot City","Gnawnian Express Station"],"Desperado":["Claw Shot City"],"Farrier":["Claw Shot City","Gnawnian Express Station"],"Lasso Cowgirl":["Claw Shot City"],"Outlaw":["Claw Shot City"],"Parlour Player":["Claw Shot City","Gnawnian Express Station"],"Prospector":["Claw Shot City"],"Pyrite":["Claw Shot City"],"Ruffian":["Claw Shot City"],"Saloon Gal":["Claw Shot City"],"Shopkeeper":["Claw Shot City"],"Stagecoach Driver":["Claw Shot City"],"Stuffy Banker":["Claw Shot City","Gnawnian Express Station"],"Tonic Salesman":["Claw Shot City","Gnawnian Express Station"],"Tumbleweed":["Claw Shot City"],"Undertaker":["Claw Shot City"],"Upper Class Lady":["Claw Shot City","Gnawnian Express Station"],"Angry Train Staff":["Gnawnian Express Station"],"Automorat":["Gnawnian Express Station"],"Black Powder Thief":["Gnawnian Express Station"],"Cannonball":["Gnawnian Express Station"],"Crate Camo":["Gnawnian Express Station"],"Cute Crate Carrier":["Gnawnian Express Station"],"Fuel":["Gnawnian Express Station"],"Hookshot":["Gnawnian Express Station"],"Magmatic Crystal Thief":["Gnawnian Express Station"],"Magmatic Golem":["Gnawnian Express Station"],"Mouse With No Name":["Gnawnian Express Station"],"Mysterious Traveller":["Gnawnian Express Station"],"Passenger":["Gnawnian Express Station"],"Photographer":["Gnawnian Express Station"],"Sharpshooter":["Gnawnian Express Station"],"Steel Horse Rider":["Gnawnian Express Station"],"Stoutgear":["Gnawnian Express Station"],"Stowaway":["Gnawnian Express Station"],"Supply Hoarder":["Gnawnian Express Station"],"Dangerous Duo":["Gnawnian Express Station"],"Train Conductor":["Gnawnian Express Station"],"Train Engineer":["Gnawnian Express Station"],"Travelling Barber":["Gnawnian Express Station"],"Warehouse Manager":["Gnawnian Express Station"],"Gluttonous Zombie":["Mousoleum","Catacombs"],"Titanic Brain-Taker":["Gloomy Greenwood"],"Mutated Brown":["Laboratory","Bazaar","Forbidden Grove","Acolyte Realm"],"Sugar Rush":["Gloomy Greenwood"],"S.N.O.W. Golem":["Ice Fortress","Festive Comet"],"Snow Boulder":["Cinnamon Hill","Festive Comet"],"Snow Sorceress":["Ice Fortress","Festive Comet"],"Reinbo":["Ice Fortress","Festive Comet"],"Snowball Hoarder":["Cinnamon Hill","Festive Comet"],"Mutated Behemoth":["Toxic Spill"],"Biohazard":["Toxic Spill"],"Bog Beast":["Toxic Spill"],"Gelatinous Octahedron":["Ronza's Shoppe","Toxic Spill"],"Hazmat":["Toxic Spill"],"Lab Technician":["Toxic Spill"],"The Menace":["Toxic Spill"],"Monster Tail":["Toxic Spill"],"Mutant Mongrel":["Toxic Spill"],"Mutant Ninja":["Toxic Spill"],"Mutated Siblings":["Toxic Spill"],"Outbreak Assassin":["Toxic Spill"],"Plague Hag":["Ronza's Shoppe","Toxic Spill"],"Scrap Metal Monster":["Toxic Spill"],"Slimefist":["Toxic Spill"],"Sludge":["Toxic Spill"],"Sludge Soaker":["Ronza's Shoppe","Toxic Spill"],"Sludge Swimmer":["Toxic Spill"],"Spore":["Ronza's Shoppe","Toxic Spill"],"Swamp Runner":["Toxic Spill"],"Telekinetic Mutant":["Toxic Spill"],"Tentacle":["Toxic Spill"],"Toxic Warrior":["Toxic Spill"],"Costumed Horse":[],"Lovely Sports":["Tournament Hall"],"Winter Games":["Tournament Hall"],"M400":[],"Breakdancer":["SUPER|brie+ Factory"],"El Flamenco":["SUPER|brie+ Factory"],"Dance Party":["SUPER|brie+ Factory"],"Para Para Dancer":["SUPER|brie+ Factory"],"Moussile":["Ronza's Shoppe"],"Cyborg":["Gnawnia Rift"],"Riftweaver":["Gnawnia Rift"],"Agitated Gentle Giant":["Gnawnia Rift"],"Raw Diamond":["Gnawnia Rift","Furoma Rift"],"Rift Guardian":["Gnawnia Rift","Furoma Rift"],"Goliath Field":["Gnawnia Rift"],"Dream Drifter":["Gnawnia Rift"],"Wealth":["Gnawnia Rift","Furoma Rift"],"Shard Centurion":["Gnawnia Rift"],"Greyrun":["Gnawnia Rift"],"Excitable Electric":["Gnawnia Rift"],"Mighty Mole":["Gnawnia Rift"],"Supernatural":["Gnawnia Rift"],"Spiritual Steel":["Gnawnia Rift"],"Micro":["Gnawnia Rift"],"Brawny":["Gnawnia Rift","Furoma Rift"],"Carefree Cook":[],"Onion Chopper":[],"Pan Slammer":[],"Ancient of the Deep":["Sunken City"],"Angelfish":["Sunken City"],"Angler":["Sunken City"],"Barnacle Beautician":["Sunken City"],"Barracuda":["Sunken City"],"Betta":["Sunken City"],"Bottom Feeder":["Sunken City"],"Carnivore":["Sunken City"],"City Noble":["Sunken City"],"City Worker":["Sunken City"],"Clownfish":["Sunken City"],"Clumsy Carrier":["Sunken City"],"Coral":["Sunken City"],"Coral Cuddler":["Sunken City"],"Coral Dragon":["Sunken City"],"Coral Gardener":["Sunken City"],"Coral Guard":["Sunken City"],"Coral Harvester":["Sunken City"],"Coral Queen":["Sunken City"],"Crabolia":["Sunken City"],"Cuttle":["Sunken City"],"Deep Sea Diver":["Sunken City"],"Deranged Deckhand":["Sunken City"],"Derpshark":["Sunken City"],"Dread Pirate Mousert":["Sunken City"],"Eel":["Sunken City"],"Elite Guardian":["Sunken City"],"Enginseer":["Sunken City"],"Guppy":["Sunken City"],"Hydrologist":["Sunken City"],"Jellyfish":["Sunken City"],"Koimaid":["Sunken City"],"Manatee":["Sunken City"],"Mermousette":["Sunken City"],"Mershark":["Sunken City"],"Mlounder Flounder":["Sunken City"],"Octomermaid":["Sunken City"],"Old One":["Sunken City"],"Oxygen Baron":["Sunken City"],"Pearl":["Sunken City"],"Pearl Diver":["Sunken City"],"Pirate Anchor":["Sunken City"],"Puffer":["Sunken City"],"Saltwater Axolotl":["Sunken City"],"Sand Dollar Diver":["Sunken City"],"Sand Dollar Queen":["Sunken City"],"School of Mish":["Sunken City"],"Seadragon":["Sunken City"],"Serpent Monster":["Sunken City"],"Spear Fisher":["Sunken City"],"Stingray":["Sunken City"],"Sunken Banshee":["Sunken City"],"Sunken Citizen":["Sunken City"],"Swashblade":["Sunken City"],"Tadpole":["Sunken City"],"Treasure Hoarder":["Sunken City"],"Treasure Keeper":["Sunken City"],"Tritus":["Sunken City"],"Turret Guard":["Sunken City"],"Urchin King":["Sunken City"],"Captain Croissant":["Windmill"],"Amplified Brown":["Burroughs Rift"],"Amplified Grey":["Burroughs Rift"],"Amplified White":["Burroughs Rift"],"Assassin Beast":["Burroughs Rift"],"Automated Sentry":["Burroughs Rift"],"Big Bad Behemoth Burroughs":["Burroughs Rift"],"Rift Bio Engineer":["Burroughs Rift"],"Boulder Biter":["Burroughs Rift"],"Clump":["Burroughs Rift"],"Count Vampire":["Burroughs Rift"],"Cyber Miner":["Burroughs Rift"],"Cybernetic Specialist":["Burroughs Rift"],"Doktor":["Burroughs Rift"],"Evil Scientist":["Burroughs Rift"],"Itty Bitty Rifty Burroughs":["Burroughs Rift"],"Lambent":["Burroughs Rift"],"Lycanoid":["Burroughs Rift"],"Master Exploder":["Burroughs Rift"],"Mecha Tail":["Burroughs Rift"],"Menace of the Rift":["Burroughs Rift"],"Monstrous Abomination":["Burroughs Rift"],"Phase Zombie":["Burroughs Rift"],"Plutonium Tentacle":["Burroughs Rift"],"Pneumatic Dirt Displacement":["Burroughs Rift"],"Portable Generator":["Burroughs Rift"],"Prototype":["Burroughs Rift"],"Super Mega Mecha Ultra RoboGold":["Burroughs Rift"],"Rancid Bog Beast":["Burroughs Rift"],"Revenant":["Burroughs Rift"],"Rifterranian":["Burroughs Rift"],"Robat":["Burroughs Rift"],"Radioactive Ooze":["Burroughs Rift"],"Surgeon Bot":["Burroughs Rift"],"Tech Ravenous Zombie":["Burroughs Rift"],"Toxic Avenger":["Burroughs Rift"],"Toxikinetic":["Burroughs Rift"],"Zombot Unipire the Third":["Burroughs Rift"],"Candy Cat":["Gloomy Greenwood"],"Candy Goblin":["Gloomy Greenwood"],"Grey Recluse":["Gloomy Greenwood"],"Hollowed":["Gloomy Greenwood"],"Mousataur Priestess":["Gloomy Greenwood"],"Shortcut":["Gloomy Greenwood"],"Tricky Witch":["Gloomy Greenwood"],"Builder":["Ice Fortress","Festive Comet"],"Frigid Foreman":["Ice Fortress","Festive Comet"],"Glacia Ice Fist":["Ice Fortress","Festive Comet"],"Hoarder":["Cinnamon Hill","Golem Workshop","Ice Fortress","Festive Comet"],"Miser":["Ice Fortress","Festive Comet"],"Stuck Snowball":["Cinnamon Hill","Golem Workshop","Ice Fortress","Festive Comet"],"Tundra Huntress":["Ice Fortress","Festive Comet"],"Borean Commander":["Ice Fortress","Festive Comet"],"Red Coat Bear":["Whisker Woods Rift"],"Monstrous Black Widow":["Whisker Woods Rift"],"Centaur Ranger":["Whisker Woods Rift"],"Karmachameleon":["Whisker Woods Rift"],"Cherry Sprite":["Whisker Woods Rift"],"Naturalist":["Whisker Woods Rift"],"Cyclops Barbarian":["Whisker Woods Rift"],"Red-Eyed Watcher Owl":["Whisker Woods Rift"],"Treant Queen":["Whisker Woods Rift"],"Spirit of Balance":["Whisker Woods Rift"],"Spirit Fox":["Whisker Woods Rift"],"Fungal Frog":["Whisker Woods Rift"],"Crazed Goblin":["Whisker Woods Rift"],"Gilded Leaf":["Whisker Woods Rift"],"Winged Harpy":["Whisker Woods Rift"],"Tri-dra":["Whisker Woods Rift"],"Mossy Moosker":["Whisker Woods Rift"],"Nomadic Warrior":["Whisker Woods Rift"],"Medicine":["Whisker Woods Rift"],"Grizzled Silth":["Whisker Woods Rift"],"Bloomed Sylvan":["Whisker Woods Rift"],"Rift Tiger":["Whisker Woods Rift"],"Twisted Treant":["Whisker Woods Rift"],"Tree Troll":["Whisker Woods Rift"],"Water Sprite":["Whisker Woods Rift"],"Cranky Caterpillar":["Whisker Woods Rift"],"Gentleman Caller":["Claw Shot City"],"Costumed Sheep":[],"Cupcake Cutie":["SUPER|brie+ Factory"],"Cupcake Runner":["SUPER|brie+ Factory"],"Chocolate Gold Foil":[],"Bitter Root":["Fungal Cavern"],"Cavern Crumbler":["Fungal Cavern"],"Crag Elder":["Fungal Cavern"],"Crystal Behemoth":["Fungal Cavern"],"Crystal Cave Worm":["Fungal Cavern"],"Crystal Controller":["Fungal Cavern"],"Crystal Golem":["Fungal Cavern"],"Crystal Lurker":["Fungal Cavern"],"Crystal Observer":["Fungal Cavern"],"Crystal Queen":["Fungal Cavern"],"Crystalback":["Fungal Cavern"],"Crystalline Slasher":["Fungal Cavern"],"Diamondhide":["Fungal Cavern"],"Dirt Thing":["Fungal Cavern"],"Floating Spore":["Fungal Cavern"],"Funglore":["Fungal Cavern"],"Gemorpher":["Fungal Cavern"],"Gemstone Worshipper":["Fungal Cavern"],"Huntereater":["Fungal Cavern"],"Lumahead":["Fungal Cavern"],"Mouldy Mole":["Fungal Cavern"],"Mush":["Fungal Cavern"],"Mushroom Sprite":["Fungal Cavern"],"Nightshade Masquerade":["Fungal Cavern"],"Quillback":["Fungal Cavern"],"Shattered Obsidian":["Fungal Cavern"],"Spiked Burrower":["Fungal Cavern"],"Splintered Stone Sentry":["Fungal Cavern"],"Spore Muncher":["Fungal Cavern"],"Sporeticus":["Fungal Cavern"],"Stalagmite":["Fungal Cavern"],"Stone Maiden":["Fungal Cavern"],"Ancient Scribe":["Zokor"],"Ash Golem":["Labyrinth","Zokor"],"Automated Stone Sentry":["Labyrinth","Zokor"],"Battle Cleric":["Zokor"],"Corridor Bruiser":["Labyrinth","Zokor"],"Dark Templar":["Labyrinth","Zokor"],"Decrepit Tentacle Terror":["Zokor"],"Drudge":["Labyrinth","Zokor"],"Ethereal Guardian":["Zokor"],"Exo-Tech":["Zokor"],"Sir Fleekio":["Zokor"],"Fungal Technomorph":["Labyrinth","Zokor"],"Hired Eidolon":["Labyrinth","Zokor"],"Lost":["Labyrinth"],"Lost Legionnaire":["Labyrinth"],"Manaforge Smith":["Zokor"],"Paladin Weapon Master":["Zokor"],"Masked Pikeman":["Labyrinth","Zokor"],"Matron of Machinery":["Zokor"],"Matron of Wealth":["Zokor"],"Mimic":["Labyrinth","Zokor"],"Mind Tearer":["Labyrinth","Zokor"],"Shadow Stalker":["Labyrinth","Zokor"],"Molten Midas":["Zokor"],"Mush Monster":["Labyrinth","Zokor"],"Mushroom Harvester":["Labyrinth","Zokor"],"Mystic Guardian":["Labyrinth","Zokor"],"Mystic Herald":["Labyrinth","Zokor"],"Mystic Scholar":["Labyrinth","Zokor"],"Nightshade Fungalmancer":["Zokor"],"Nightshade Nanny":["Labyrinth","Zokor"],"Reanimated Carver":["Labyrinth","Zokor"],"Retired Minotaur":["Zokor"],"RR-8":["Labyrinth","Zokor"],"Sanguinarian":["Labyrinth","Zokor"],"Solemn Soldier":["Labyrinth","Zokor"],"Soul Binder":["Zokor"],"Summoning Scholar":["Labyrinth","Zokor"],"Tech Golem":["Labyrinth","Zokor"],"Treasure Brawler":["Labyrinth","Zokor"],"Dire Lycan":["Gloomy Greenwood"],"Gourd Ghoul":["Gloomy Greenwood"],"Hollowed Minion":["Gloomy Greenwood"],"Bonbon Gummy Globlin":["Gloomy Greenwood"],"Maize Harvester":["Gloomy Greenwood"],"Spectral Butler":["Gloomy Greenwood"],"Teenage Vampire":["Gloomy Greenwood"],"Black Diamond Racer":["Cinnamon Hill","Festive Comet"],"Double Black Diamond Racer":["Cinnamon Hill","Festive Comet"],"Free Skiing":["Cinnamon Hill","Festive Comet"],"Young Prodigy Racer":["Cinnamon Hill","Festive Comet"],"Nitro Racer":["Cinnamon Hill","Festive Comet"],"Sporty Ski Instructor":["Cinnamon Hill","Festive Comet"],"Toboggan Technician":["Cinnamon Hill","Festive Comet"],"Rainbow Racer":["Cinnamon Hill","Festive Comet"],"Costumed Monkey":[],"Cupcake Camo":["SUPER|brie+ Factory"],"Cupcake Candle Thief":["SUPER|brie+ Factory"],"Armored Archer":["Furoma Rift"],"Dancing Assassin":["Furoma Rift"],"Master of the Chi Belt":["Furoma Rift"],"Student of the Chi Belt":["Furoma Rift"],"Master of the Chi Claw":["Furoma Rift"],"Student of the Chi Claw":["Furoma Rift"],"Grand Master of the Dojo":["Furoma Rift"],"Supreme Sensei":["Furoma Rift"],"Dumpling Delivery":["Furoma Rift"],"Master of the Chi Fang":["Furoma Rift"],"Student of the Chi Fang":["Furoma Rift"],"Ascended Elder":["Furoma Rift"],"Shaolin Kung Fu":["Furoma Rift"],"Wandering Monk":["Furoma Rift"],"Shinobi":["Furoma Rift"],"Militant Samurai":["Furoma Rift"],"Enlightened Labourer":["Furoma Rift"],"Wave Racer":["Tournament Hall"],"Creepy Marionette":["Gloomy Greenwood"],"Sandmouse":["Gloomy Greenwood"],"Arcane Summoner":["Fort Rox"],"Meteorite Mover":["Fort Rox"],"Battering Ram":["Fort Rox"],"Cursed Taskmaster":["Fort Rox"],"Dawn Guardian":["Fort Rox"],"Mining Materials Manager":["Fort Rox"],"Night Shift Materials Manager":["Fort Rox"],"Hardworking Hauler":["Fort Rox"],"Mischievous Meteorite Miner":["Fort Rox"],"Mischievous Wereminer":["Fort Rox"],"Monster of the Meteor":["Fort Rox"],"Meteorite Golem":["Fort Rox"],"Meteorite Miner":["Fort Rox"],"Meteorite Mystic":["Fort Rox"],"Hypnotized Gunslinger":["Fort Rox"],"Meteorite Snacker":["Fort Rox"],"Night Watcher":["Fort Rox"],"Nightfire":["Fort Rox"],"Nightmancer":["Fort Rox"],"Reveling Lycanthrope":["Fort Rox"],"Wealthy Werewarrior":["Fort Rox"],"Alpha Weremouse":["Fort Rox"],"Werehauler":["Fort Rox"],"Wereminer":["Fort Rox"],"Joy":["Cinnamon Hill","Golem Workshop","Ice Fortress","Festive Comet"],"Great Winter Hunt Impostor":["Ice Fortress","Festive Comet"],"Frightened Flying Fireworks":["Cinnamon Hill","Festive Comet"],"Costumed Rooster":[],"Sprinkly Sweet Cupcake Cook":["SUPER|brie+ Factory"],"Heart of the Meteor":["Fort Rox"],"Barmy Gunner":["Harbour"],"Bilged Boatswain":["Harbour"],"Cabin Boy":["Harbour"],"Corrupt Commodore":["Harbour"],"Dashing Buccaneer":["Harbour"],"Eggsquisite Entertainer":[],"Tomb Exhumer":["Gloomy Greenwood","Burroughs Rift"],"Absolute Acolyte":["Bristle Woods Rift"],"Chronomaster":["Bristle Woods Rift"],"Vigilant Ward":["Bristle Woods Rift"],"Portal Paladin":["Bristle Woods Rift"],"Epoch Golem":["Bristle Woods Rift"],"Timeslither Pythoness":["Bristle Woods Rift"],"Record Keeper":["Bristle Woods Rift"],"Record Keeper's Assistant":["Bristle Woods Rift"],"Timeless Lich":["Bristle Woods Rift"],"Sentient Slime":["Bristle Woods Rift"],"Chamber Cleaver":["Bristle Woods Rift"],"Harbinger of Death":["Bristle Woods Rift"],"Portal Plunderer":["Bristle Woods Rift"],"Skeletal Champion":["Bristle Woods Rift"],"Timelost Thaumaturge":["Bristle Woods Rift"],"Shackled Servant":["Bristle Woods Rift"],"Clockwork Timespinner":["Bristle Woods Rift"],"Portal Pursuer":["Bristle Woods Rift"],"Dread Knight":["Bristle Woods Rift"],"Carrion Medium":["Bristle Woods Rift"],"Artillery Commander":["Fiery Warpath"],"Charming Chimer":["Moussu Picchu"],"Cloud Collector":["Moussu Picchu"],"Cycloness":["Moussu Picchu"],"Dragoon":["Moussu Picchu"],"Fluttering Flutist":["Moussu Picchu"],"Ful'Mina the Mountain Queen":["Moussu Picchu"],"Homeopathic Apothecary":["Moussu Picchu"],"Monsoon Maker":["Moussu Picchu"],"Nightshade Flower Girl":["Moussu Picchu"],"Nightshade Maiden":["Moussu Picchu"],"Rain Collector":["Moussu Picchu"],"Rainwater Purifier":["Moussu Picchu"],"Rain Wallower":["Moussu Picchu"],"Rainmancer":["Moussu Picchu"],"Spore Salesman":["Moussu Picchu"],"Rain Summoner":["Moussu Picchu"],"Thundering Watcher":["Moussu Picchu"],"⚡Thunderlord⚡":["Moussu Picchu"],"Thunder Strike":["Moussu Picchu"],"Violet Stormchild":["Moussu Picchu"],"Breeze Borrower":["Moussu Picchu"],"Windy Farmer":["Moussu Picchu"],"Wind Warrior":["Moussu Picchu"],"Wind Watcher":["Moussu Picchu"],"Captain Cannonball":["Gloomy Greenwood"],"Ghost Pirate Queen":["Gloomy Greenwood"],"Scorned Pirate":["Gloomy Greenwood"],"Spectral Swashbuckler":["Gloomy Greenwood"],"Craggy Ore":["Mountain"],"Mountain":["Mountain"],"Slope Swimmer":["Mountain"],"Snow Golem Jockey":["Cinnamon Hill","Festive Comet"],"Nice Knitting":["Cinnamon Hill","Festive Comet"],"Snow Golem Architect":["Golem Workshop","Festive Comet"],"Naughty Nougat":["Ice Fortress","Festive Comet"],"Costumed Dog":[],"Lunar Red Candle Maker":[],"Reality Restitch":["SUPER|brie+ Factory"],"Time Punk":["SUPER|brie+ Factory"],"Time Tailor":["SUPER|brie+ Factory"],"Time Thief":["SUPER|brie+ Factory"],"Spring Sprig":[],"Chip Chiseler":["Cantera Quarry"],"Croquet Crusher":["Queso River"],"Fiery Crusher":["Cantera Quarry"],"Grampa Golem":["Cantera Quarry"],"Nachore Golem":["Cantera Quarry"],"Nachous the Molten":["Cantera Quarry"],"Ore Chipper":["Cantera Quarry"],"Pump Raider":["Queso River"],"Queso Extractor":["Queso River"],"Queen Quesada":["Queso River"],"Rubble Rouser":["Cantera Quarry"],"Rubble Rummager":["Cantera Quarry"],"Sleepy Merchant":["Queso River"],"Old Spice Collector":["Prickly Plains"],"Spice Farmer":["Prickly Plains"],"Spice Finder":["Prickly Plains"],"Granny Spice":["Prickly Plains"],"Spice Raider":["Prickly Plains"],"Spice Reaper":["Prickly Plains"],"Spice Seer":["Prickly Plains"],"Inferna the Engulfed":["Prickly Plains"],"Spice Sovereign":["Prickly Plains"],"Tiny Saboteur":["Queso River"],"Tiny Toppler":["Cantera Quarry"],"Clumsy Chemist":["Laboratory"],"Coffin Zombie":["Mousoleum"],"Admiral Arrrgh":["Gloomy Greenwood"],"Mutated Mole":["Laboratory"],"Sludge Scientist":["Laboratory"],"Squeaker Bot":["Laboratory"],"Glazy":["Cinnamon Hill","Golem Workshop","Ice Fortress","Festive Comet"],"Iceberg Sculptor":["Ice Fortress","Festive Comet"],"Costumed Pig":[],"Cheesy Party":["SUPER|brie+ Factory"],"Factory Technician":["SUPER|brie+ Factory"],"Vincent the Magnificent":["SUPER|brie+ Factory"],"Fuzzy Drake":["Queso Geyser"],"Rambunctious Rain Rumbler":["Queso Geyser"],"Horned Cork Hoarder":["Ronza's Shoppe","Queso Geyser"],"Burly Bruiser":["Queso Geyser"],"Cork Defender":["Queso Geyser"],"Corky the Collector":["Queso Geyser"],"Corkataur":["Queso Geyser"],"Stormsurge the Vile Tempest":["Queso Geyser"],"Bruticus the Blazing":["Queso Geyser"],"Ignatia":["Ronza's Shoppe","Queso Geyser"],"Cinderstorm":["Ronza's Shoppe","Queso Geyser"],"Bearded Elder":["Queso Geyser"],"Smoldersnap":["Queso Geyser"],"Mild Spicekin":["Queso Geyser"],"Sizzle Pup":["Queso Geyser"],"Kalor'ignis of the Geyser":["Queso Geyser"],"Pyrehyde":["Queso Geyser"],"Vaporior":["Ronza's Shoppe","Queso Geyser"],"Warming Wyvern":["Queso Geyser"],"Steam Sailor":["Queso Geyser"],"Emberstone Scaled":["Queso Geyser"],"One-Mouse Band":["Valour Rift"],"Champion Danseuse":["Valour Rift"],"Withered Remains":["Valour Rift"],"Arch Champion Necromancer":["Valour Rift"],"Shade of the Eclipse":["Valour Rift"],"Timid Explorer":["Valour Rift"],"Elixir Maker":["Valour Rift"],"The Total Eclipse":["Valour Rift"],"Unwavering Adventurer":["Valour Rift"],"Lumi-lancer":["Valour Rift"],"Berzerker":["Valour Rift"],"Mouse of Elements":["Valour Rift"],"Magic Champion":["Valour Rift"],"Martial":["Valour Rift"],"Praetorian Champion":["Valour Rift"],"Bulwark of Ascent":["Valour Rift"],"Cursed Crusader":["Valour Rift"],"Fallen Champion Footman":["Valour Rift"],"Soldier of the Shade":["Valour Rift"],"Possessed Armaments":["Valour Rift"],"Prestigious Adventurer":["Valour Rift"],"Puppetto":["Valour Rift"],"Puppet Champion":["Valour Rift"],"Terrified Adventurer":["Valour Rift"],"Cutpurse":["Valour Rift"],"Champion Thief":["Valour Rift"],"Shorts-All-Year":["Cinnamon Hill","Festive Comet"],"Costumed Rat":[],"Fete Fromager":["SUPER|brie+ Factory"],"Admiral Cloudbeard":["Floating Islands"],"Agent M":["Floating Islands"],"Paragon of Arcane":["Floating Islands"],"Astrological Astronomer":["Floating Islands"],"Captain Cloudkicker":["Floating Islands"],"Cloud Miner":["Floating Islands"],"Cumulost":["Floating Islands"],"Cute Cloud Conjurer":["Floating Islands"],"Cutthroat Cannoneer":["Floating Islands"],"Cutthroat Pirate":["Floating Islands"],"Daydreamer":["Floating Islands"],"Devious Gentleman":["Floating Islands"],"Paragon of Dragons":["Floating Islands"],"Dragonbreather":["Floating Islands"],"Lancer Guard":["Floating Islands"],"Warden of Fog":["Floating Islands"],"Paragon of Forgotten":["Floating Islands"],"Warden of Frost":["Floating Islands"],"Ground Gavaleer":["Floating Islands"],"Gyrologer":["Floating Islands"],"Herc":["Floating Islands"],"Paragon of Water":["Floating Islands"],"Kite Flyer":["Floating Islands"],"Launchpad Labourer":["Floating Islands"],"Paragon of the Lawless":["Floating Islands"],"Lawbender":["Floating Islands"],"Mairitime Pirate":["Floating Islands"],"Mist Maker":["Floating Islands"],"Nimbomancer":["Floating Islands"],"Overcaster":["Floating Islands"],"Paragon of Strength":["Floating Islands"],"Warden of Rain":["Floating Islands"],"Regal Spearman":["Floating Islands"],"Richard the Rich":["Floating Islands"],"Scarlet Revenger":["Floating Islands"],"Seasoned Islandographer":["Floating Islands"],"Paragon of Shadow":["Floating Islands"],"Shadow Sage":["Floating Islands"],"Sky Dancer":["Floating Islands"],"Sky Glass Glazier":["Floating Islands"],"Sky Glass Sorcerer":["Floating Islands"],"Sky Greaser":["Floating Islands"],"Sky Highborne":["Floating Islands"],"Sky Squire":["Floating Islands"],"Sky Surfer":["Floating Islands"],"Sky Swordsman":["Floating Islands"],"Skydiver":["Floating Islands"],"Spheric Diviner":["Floating Islands"],"Spry Sky Explorer":["Floating Islands"],"Spry Sky Seer":["Floating Islands"],"Stack of Thieves":["Floating Islands"],"Stratocaster":["Floating Islands"],"Suave Pirate":["Floating Islands"],"Paragon of Tactics":["Floating Islands"],"Tiny Dragonfly":["Floating Islands"],"Warden of Wind":["Floating Islands"],"Worried Wayfinder":["Floating Islands"],"Great Giftnapper":["Cinnamon Hill","Festive Comet"],"Costumed Ox":[],"Space Party-Time Plumber":["SUPER|brie+ Factory"],"Sky Glider":["Floating Islands"],"Consumed Charm Tinkerer":["Floating Islands"],"Empyrean Geologist":["Floating Islands"],"Empyrean Javelineer":["Floating Islands"],"Forgotten Elder":["Floating Islands"],"Cloud Strider":["Floating Islands"],"Aristo-Cat Burglar":["Floating Islands"],"Fortuitous Fool":["Floating Islands"],"Empyrean Appraiser":["Floating Islands"],"Glamorous Gladiator":["Floating Islands"],"Peggy the Plunderer":["Floating Islands"],"Zealous Academic":["Floating Islands"],"Rocketeer":["Floating Islands"],"Empyrean Empress":["Floating Islands"],"Baba Gaga":["Gloomy Greenwood"],"Ol' King Coal":["Cinnamon Hill","Festive Comet"],"Angry Aphid":["Foreword Farm"],"Architeuthulhu of the Abyss":["Prologue Pond"],"Beachcomber":["Prologue Pond"],"Bitter Grammarian":["Table of Contents"],"Brothers Grimmaus":["Table of Contents"],"Careless Catfish":["Prologue Pond"],"Covetous Coastguard":["Prologue Pond"],"Crazed Cultivator":["Foreword Farm"],"Fibbocchio":["Table of Contents"],"Flamboyant Flautist":["Table of Contents"],"Greenbeard":["Table of Contents"],"Grit Grifter":["Foreword Farm"],"Hans Cheesetian Squeakersen":["Table of Contents"],"Humphrey Dumphrey":["Table of Contents"],"Ice Regent":["Table of Contents"],"Land Loafer":["Foreword Farm"],"Little Bo Squeak":["Table of Contents"],"Little Miss Fluffet":["Table of Contents"],"Loathsome Locust":["Foreword Farm"],"Madame d'Ormouse":["Table of Contents"],"Matriarch Gander":["Table of Contents"],"Melodramatic Minnow":["Prologue Pond"],"Mighty Mite":["Foreword Farm"],"Mythweaver":["Table of Contents"],"Nefarious Nautilus":["Prologue Pond"],"Pinkielina":["Table of Contents"],"Pompous Perch":["Prologue Pond"],"Princess and the Olive":["Table of Contents"],"Root Rummager":["Foreword Farm"],"Sand Sifter":["Prologue Pond"],"Sinister Squid":["Prologue Pond"],"Tackle Tracker":["Prologue Pond"],"Vicious Vampire Squid":["Prologue Pond"],"Wily Weevil":["Foreword Farm"],"Monstrous Midge":["Foreword Farm"],"Frost King":["Ice Fortress"],"Baroness Von Bean":["Bountiful Beanstalk"],"Baroque Dancer":["Bountiful Beanstalk"],"Budrich Thornborn":["Bountiful Beanstalk"],"Cagey Countess":["Bountiful Beanstalk"],"Cell Sweeper":["Bountiful Beanstalk"],"Chafed Cellist":["Bountiful Beanstalk"],"Clumsy Cupbearer":["Bountiful Beanstalk"],"Dastardly Duchess":["Bountiful Beanstalk"],"Diminutive Detainee":["Bountiful Beanstalk"],"Dungeon Master":["Bountiful Beanstalk"],"Gate Keeper":["Bountiful Beanstalk"],"Jovial Jailor":["Bountiful Beanstalk"],"Key Master":["Bountiful Beanstalk"],"Leafton Beanwell":["Bountiful Beanstalk"],"Lethargic Guard":["Bountiful Beanstalk"],"Malevolent Maestro":["Bountiful Beanstalk"],"Malicious Marquis":["Bountiful Beanstalk"],"Mythical Giant King":["Bountiful Beanstalk"],"Obstinate Oboist":["Bountiful Beanstalk"],"Peaceful Prisoner":["Bountiful Beanstalk"],"Peevish Piccoloist":["Bountiful Beanstalk"],"Pernicious Prince":["Bountiful Beanstalk"],"Plotting Page":["Bountiful Beanstalk"],"Sassy Salsa Dancer":["Bountiful Beanstalk"],"Scheming Squire":["Bountiful Beanstalk"],"Smug Smuggler":["Bountiful Beanstalk"],"Sultry Saxophonist":["Bountiful Beanstalk"],"Treacherous Tubaist":["Bountiful Beanstalk"],"Vindictive Viscount":["Bountiful Beanstalk"],"Vinneus Stalkhome":["Bountiful Beanstalk"],"Violent Violinist":["Bountiful Beanstalk"],"Whimsical Waltzer":["Bountiful Beanstalk"],"Wrathful Warden":["Bountiful Beanstalk"],"Herbaceous Bravestalk":["Bountiful Beanstalk"],"M1000":["Table of Contents"],"Arcana Overachiever":["School of Sorcery"],"Arcane Master Sorcerer":["School of Sorcery"],"Audacious Alchemist":["School of Sorcery"],"Bookworm":["School of Sorcery"],"Broomstick Bungler":["School of Sorcery"],"Celestial Summoner":["School of Sorcery"],"Cheat Sheet Conjurer":["School of Sorcery"],"Class Clown":["School of Sorcery"],"Classroom Disrupter":["School of Sorcery"],"Classroom Keener":["School of Sorcery"],"Constructively Critical Artist":["School of Sorcery"],"Data Devourer":["School of Sorcery"],"Enchanted Chess Club Champion":["School of Sorcery"],"Featherlight":["School of Sorcery"],"Hall Monitor":["School of Sorcery"],"Illustrious Illusionist":["School of Sorcery"],"Invisible Fashionista":["School of Sorcery"],"Magical Multitasker":["School of Sorcery"],"Misfortune Teller":["School of Sorcery"],"Mixing Mishap":["School of Sorcery"],"Mythical Master Sorcerer":["School of Sorcery"],"Perpetual Detention":["School of Sorcery"],"Prestigious Prestidigitator":["School of Sorcery"],"Shadow Master Sorcerer":["School of Sorcery"],"Sleep Starved Scholar":["School of Sorcery"],"Teleporting Truant":["School of Sorcery"],"Tyrannical Thaumaturge":["School of Sorcery"],"Uncoordinated Cauldron Carrier":["School of Sorcery"],"Crematio Scorchworth":["Ronza's Shoppe","Draconic Depths"],"Malignus Vilestrom":["Ronza's Shoppe","Draconic Depths"],"Rimeus Polarblast":["Ronza's Shoppe","Draconic Depths"],"Absolutia Harmonius":["Draconic Depths"],"Arcticus the Biting Frost":["Draconic Depths"],"Avalancheus the Glacial":["Draconic Depths"],"Belchazar Banewright":["Draconic Depths"],"Blizzara Winterosa":["Draconic Depths"],"Chillandria Permafrost":["Draconic Depths"],"Colonel Crisp":["Draconic Depths"],"Combustius Furnaceheart":["Draconic Depths"],"Corrupticus the Blight Baron":["Draconic Depths"],"Dreck Grimehaven":["Draconic Depths"],"Flamina Cinderbreath":["Draconic Depths"],"Frigidocius Coldshot":["Draconic Depths"],"Frostnip Icebound":["Draconic Depths"],"Goopus Dredgemore":["Draconic Depths"],"Iciclesius the Defender":["Draconic Depths"],"Incendarius the Unquenchable":["Draconic Depths"],"Magnatius Majestica":["Draconic Depths"],"Mythical Dragon Emperor":["Draconic Depths"],"Noxio Sludgewell":["Draconic Depths"],"Pestilentia the Putrid":["Draconic Depths"],"Squire Sizzleton":["Draconic Depths"],"Sulfurious the Raging Inferno":["Draconic Depths"],"Supremia Magnificus":["Draconic Depths"],"Three'amat the Mother of Dragons":["Draconic Depths"],"Torchbearer Tinderhelm":["Draconic Depths"],"Tranquilia Protecticus":["Draconic Depths"],"Venomona Festerbloom":["Draconic Depths"]}
  
  const event_mice = ["Calligraphy","Red Envelope","Lunar Red Candle Maker","Costumed Rat","Costumed Ox","Costumed Tiger","Costumed Rabbit","Costumed Dragon","Costumed Snake","Costumed Horse","Costumed Sheep","Costumed Monkey","Costumed Rooster","Costumed Dog","Costumed Pig","Present","Terrible Twos","Buckethead","Pintail","Birthday","Sleepwalker","Dinosuit","Cheesy Party","Factory Technician","Force Fighter Blue","Force Fighter Yellow","Force Fighter Red","Force Fighter Pink","Force Fighter Green","Super FighterBot MegaSupreme","Fete Fromager","Dance Party","Breakdancer","Para Para Dancer","El Flamenco","Cupcake Candle Thief","Cupcake Runner","Cupcake Camo","Cupcake Cutie","Sprinkly Sweet Cupcake Cook","Reality Restitch","Space Party-Time Plumber","Time Punk","Time Tailor","Time Thief","Vincent the Magnificent","Chocolate Overload","Egg Painter","Sinister Egg Painter","Egg Scrambler","Coco Commander","Eggsplosive Scientist","Carefree Cook","Eggscavator","Eggsquisite Entertainer","Onion Chopper","Spring Sprig","Hardboiled","Pan Slammer","Hare Razer","Chocolate Gold Foil","Teenage Vampire","Zombot Unipire","Spirit Light","Hollowhead","Cobweb","Tomb Exhumer","Dire Lycan","Candy Cat","Tricky Witch","Pumpkin Hoarder","Candy Goblin","Shortcut","Wild Chainsaw","Gourdborg","Treat","Trick","Grave Robber","Scorned Pirate","Grey Recluse","Spectral Swashbuckler","Maize Harvester","Spectral Butler","Sugar Rush","Gourd Ghoul","Hollowed","Hollowed Minion","Ghost Pirate Queen","Creepy Marionette","Swamp Thang","Titanic Brain-Taker","Mousataur Priestess","Bonbon Gummy Globlin","Sandmouse","Captain Cannonball","Admiral Arrrgh","Baba Gaga","Black Diamond Racer","Nice Knitting","Triple Lutz","Toboggan Technician","Sporty Ski Instructor","Snow Golem Architect","Snowglobe","Snowblower","Snowball Hoarder","Reinbo","Snow Sorceress","S.N.O.W. Golem","Ridiculous Sweater","Ribbon","Nitro Racer","Snow Boulder","Joy","Greedy Al","Double Black Diamond Racer","Gingerbread","Confused Courier","Glazy","Snow Golem Jockey","Free Skiing","Young Prodigy Racer","Toy","Candy Cane","Destructoy","Toy Tinkerer","Christmas Tree","Nutcracker","Elf","Snow Scavenger","Ornament","Snowflake","Missile Toe","Wreath Thief","Stocking","Snow Fort","Scrooge","Mouse of Winter Future","Mouse of Winter Past","Mouse of Winter Present","Slay Ride","Mad Elf","Squeaker Claws","Frigid Foreman","Stuck Snowball","Hoarder","Builder","Miser","Glacia Ice Fist","Tundra Huntress","Borean Commander","Rainbow Racer","Great Winter Hunt Impostor","Naughty Nougat","Iceberg Sculptor","Shorts-All-Year","Great Giftnapper","Ol' King Coal","Frost King","Frightened Flying Fireworks","Party Head","New Year's","Treasurer","Snooty","High Roller","Mobster","Leprechaun","Lucky","Moussile","Rockstar", "Relic Hunter"]
  event_mice.forEach(key => delete(mouseLocationsData[key]))

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
  const saveNavigationState = () => {
    const navState = {
      currentView: currentView,
      navigationStack: navigationStack
    };
    localStorage.setItem('umm_tracker_current_tab', JSON.stringify(navState));
  };

  const enterRegion = (regionGroup) => {
    updateRegionUI(regionGroup);
    saveNavigationState();
  };

  const toggleLocationCollapse = (locationGroup) => {
    updateLocationUI(locationGroup);
    saveNavigationState();
  };

  const updateRegionUI = (regionGroup) => {
    // Instead of toggling collapse, navigate to region
    currentView = regionGroup.groupName;
    navigationStack.push(currentView);
    updateMouseListUI();
  };


    const updateLocationUI = (locationGroup) => {
    // Instead of toggling collapse, navigate to location
    currentView = locationGroup.groupName;
    navigationStack.push(currentView);
    updateMouseListUI();
    };



  function correctGroupName(groupName){
    const regionTranslationDict = {
      "riftopia": "Rift Plane",
      "gnawnia": "Gnawnia",
      "burroughs": "Burroughs",
      "furoma": "Furoma",
      "bristle_woods": "Bristle Woods",
      "tribal_isles": "Tribal Isles",
      "valour": "Valour",
      "whisker_woods": "Whisker Woods",
      "desert": "Sandtail Desert",
      "rodentia": "Rodentia",
      "varmint_valley": "Varmint Valley",
      "queso_canyon": "Queso Canyon",
      "zokor_zone": "Hollow Heights",
      "folklore_forest": "Folklore Forest"
  
    }
    let correctedGroupname = regionTranslationDict[groupName] ?? "Unknown Region"

    return correctedGroupname
  }

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
    
    // Reset navigation state as well
    currentView = 'root';
    navigationStack = [];
    localStorage.removeItem('umm_tracker_current_tab');
  
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
  async function initializeTracker() {
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
    
    // Load saved navigation state
    const savedNavState = localStorage.getItem('umm_tracker_current_tab');
    if (savedNavState) {
      try {
        const navData = JSON.parse(savedNavState);
        currentView = navData.currentView || 'root';
        navigationStack = navData.navigationStack || [];
      } catch (e) {
        console.error("Error parsing saved navigation state:", e);
        currentView = 'root';
        navigationStack = [];
      }
    }
    
    updateUI();
  }

  // --- no longer used methods
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
  const calculateDefaultTrackerWidth = () => {
    let longestMouseNameWidth = 0;
    md.forEach(mouse => {
      longestMouseNameWidth = Math.max(longestMouseNameWidth, calculateTextWidth(mouse.name));
    });
    return longestMouseNameWidth + 40;
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

  initializeTracker();

})();

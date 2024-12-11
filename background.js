// Existing function to update the context menu dynamically
function updateContextMenu() {
    // Clear all existing menu items
    chrome.contextMenus.removeAll(() => {
        // Recreate the parent "Add Tab" menu
        chrome.contextMenus.create({
            id: 'addTab',
            title: 'Add Tab',
            contexts: ['page'], // Show when right-clicking on a webpage
        });

        // Fetch setups from storage and dynamically create submenus
        chrome.storage.sync.get('setups', (data) => {
            const setups = data.setups || [];
            setups.forEach((setup, index) => {
                chrome.contextMenus.create({
                    id: `addTabToModule-${index}`,
                    parentId: 'addTab',
                    title: setup.title,
                    contexts: ['page'], // Attach to "Add Tab"
                });
            });
        });
    });
}

// Function to add the current tab's URL to a selected module
function addTabToSetup(index, url) {
    chrome.storage.sync.get('setups', (data) => {
        const setups = data.setups || [];

        // Add the URL to the selected module's URLs list
        setups[index].urls.push(url);

        // Save the updated list of setups back to storage
        chrome.storage.sync.set({ setups }, () => {
            alert(`Tab added to ${setups[index].title}`);
        });
    });
}

// Listen for when a context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Check if a submenu item was clicked (i.e., one of the modules)
    if (info.menuItemId.startsWith('addTabToModule-')) {
        const index = parseInt(info.menuItemId.replace('addTabToModule-', ''), 10);
        addTabToSetup(index, tab.url); // Add the tab URL to the selected module
    }
});

// Update the context menu dynamically when a new setup is added or modified
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.setups) {
        updateContextMenu();
    }
});

// Initial setup of the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    updateContextMenu();
});

// ----------------------------
// Code for Update Check
// ----------------------------

const currentVersion = "1.0.0"; // Set to the version you're currently using
const versionUrl = "https://github.com/GamingRadar/TabZone-extension/main/version.json"; // Replace with your actual GitHub URL

// Function to check for updates
async function checkForUpdate() {
    try {
        const response = await fetch(versionUrl);
        if (!response.ok) throw new Error("Failed to fetch version information.");

        const versionData = await response.json();

        // Compare versions
        if (versionData.version !== currentVersion) {
            const isMandatory = versionData.updateType === "mandatory"; // Check if update is mandatory

            // Show the update notification
            const updateMessage = versionData.updateMessage || `A new version (${versionData.version}) is available!`;
            showUpdateNotification(updateMessage, versionData.version, isMandatory);
        }
    } catch (error) {
        console.error("Error checking for updates:", error);
    }
}

// Function to show browser notification
function showUpdateNotification(message, version, isMandatory) {
    const notificationOptions = {
        type: "basic",
        iconUrl: "icon48.png", // Replace with your extension's icon
        title: isMandatory ? "Mandatory Update Required" : "Update Available",
        message: `${message} \nVersion: ${version}`,
        buttons: [
            { title: "Go to Update" },
            { title: "Cancel" }
        ],
        requireInteraction: true // Keeps the notification open until user interacts
    };

    chrome.notifications.create("updateNotification", notificationOptions, (id) => {
        chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
            if (notifId === "updateNotification") {
                if (btnIdx === 0) {
                    // Open the GitHub page to update
                    chrome.tabs.create({ url: "https://github.com/GamingRadar/TabZone-extension" }); // Replace with your GitHub repo URL
                } else if (btnIdx === 1 && isMandatory) {
                    // Alert the user that a mandatory update cannot be dismissed
                    alert("This update is required to continue using the extension.");
                }
                chrome.notifications.clear("updateNotification");
            }
        });
    });
}

// Run the update check immediately on extension load
checkForUpdate();

// Optional: Set an interval to check for updates periodically (every 24 hours)
setInterval(() => {
    checkForUpdate();
}, 24 * 60 * 60 * 1000); // Check every 24 hours

// Function to update the context menu dynamically
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

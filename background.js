chrome.runtime.onInstalled.addListener(() => {
    // Create the "Add Tab" parent menu item
    chrome.contextMenus.create({
        id: 'addTab',
        title: 'Add Tab',
        contexts: ['page'], // Right-click on the page
    });
});

// Listen for when a context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Check if the clicked item is the "Add Tab" option
    if (info.menuItemId === 'addTab') {
        // Get all saved setups (modules) from storage
        chrome.storage.sync.get('setups', (data) => {
            const setups = data.setups || [];

            // If no modules exist, show an alert
            if (setups.length === 0) {
                alert('No modules created yet!');
                return;
            }

            // Create submenu items dynamically for each saved setup (module)
            setups.forEach((setup, index) => {
                // Create a submenu for each saved module
                chrome.contextMenus.create({
                    id: `addTabToModule-${index}`,  // Unique id for each module
                    parentId: 'addTab',             // Attach it under the "Add Tab" menu
                    title: setup.title,            // Module title (e.g., "Study", "Job Hunt")
                    contexts: ['page'],            // Right-click on the page
                });
            });
        });
    }

    // Check if a submenu item was clicked (i.e., one of the modules)
    if (info.menuItemId.startsWith('addTabToModule-')) {
        const index = parseInt(info.menuItemId.replace('addTabToModule-', ''), 10);
        addTabToSetup(index, tab.url);  // Add the tab URL to the selected module
    }
});

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

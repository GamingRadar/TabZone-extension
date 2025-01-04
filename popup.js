const setupList = document.getElementById('setupList');
const toggleButton = document.getElementById("toggle");

// Load setups from storage and dynamically add buttons
chrome.storage.sync.get('setups', (data) => {
    const setups = data.setups || [];
    setups.forEach((setup) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = setup.title;
        btn.classList.add('setup-btn');

        // Apply the background color of the zone to the button
        btn.style.backgroundColor = setup.color || '#3498db'; // Default to blue if no color set

        btn.addEventListener('click', () => {
            setup.urls.forEach((url) => chrome.tabs.create({ url }));
        });

        li.appendChild(btn);
        setupList.appendChild(li);
    });
});

// Navigate to Configuration Page
document.getElementById('configureBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
// Function to apply the theme
function applyTheme(isDark) {
    // Set background color for the popup-container
    const popupContainer = document.querySelector(".popup-container");
    if (popupContainer) {
        popupContainer.style.backgroundColor = isDark ? "#0f1924" : "#ecf0f1";
    }

    // Set text color for titles and buttons
    const titles = document.querySelectorAll("h1, p");
    titles.forEach((title) => {
        title.style.color = isDark ? "#ecf0f1" : "#2c3e50";
    });

    // Save preference to localStorage
    localStorage.setItem("isDarkTheme", isDark ? "true" : "false");
}

// Function to initialize the theme
function initializeTheme() {
    const isDark = localStorage.getItem("isDarkTheme") === "true";
    toggleButton.checked = isDark; // Set the toggle button state
    applyTheme(isDark);
}

// Event listener for the toggle button
toggleButton.addEventListener("change", () => {
    applyTheme(toggleButton.checked);
});

// Initialize theme on load
initializeTheme();

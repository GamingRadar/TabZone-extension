const setupList = document.getElementById('setupList');

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

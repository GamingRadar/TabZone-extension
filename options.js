const setupList = document.getElementById('setupList');
const addSetupBtn = document.getElementById('addSetupBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn'); // Use a separate button for import
const importInput = document.getElementById('importInput');
const optionsContainer = document.querySelector(".options-container");

// Pre-defined color options for setup zones
const colorOptions = [
    { name: "Off-White", hex: "#EDF6F9" },
    { name: "Grey Cloud", hex: "#edede9" },
    { name: "Playful Blue", hex: "#A2D2FF" },
    { name: "Light Green", hex: "#7bf1a8" },
    { name: "Funky Yellow", hex: "#ffe45e" },
    { name: "Joy Pink", hex: "#FFAFCC" },
    { name: "Lavender", hex: "#CDB4DB" },
    { name: "Peach", hex: "#f4a261" },
    { name: "Mint", hex: "#B8E0D2" },
    { name: "Caramel", hex: "#E29578" },
];

// Function to apply the theme based on dark mode preference
function applyTheme(isDark) {
    document.body.style.backgroundColor = isDark ? "#0f1924" : "#ecf0f1";
}

// Load setups from storage and render them in the UI
chrome.storage.sync.get('setups', (data) => {
    const setups = data.setups || [];
    setups.forEach((setup, index) => {
        const li = document.createElement('li');
        li.classList.add('setup-item');
        li.innerHTML = `
            <div class="zone" style="background-color: ${setup.color || '#ffffff'}">
                <span class="setup-title">${setup.title}</span>
                <div class="actions">
                    <button class="add-tab-btn green-btn">Add Tab</button>
                    <button class="edit-btn blue-btn">Edit</button>
                    <select class="color-dropdown">
                        ${colorOptions.map(option =>
            `<option value="${option.hex}" ${setup.color === option.hex ? 'selected' : ''}>${option.name}</option>`
        ).join('')}
                    </select>
                    <button class="delete-btn red-btn">Delete</button>
                </div>
                <div class="add-tab-form" style="display:none;">
                    <input type="text" class="tab-url" placeholder="Paste URL here..." />
                    <button class="submit-tab-btn green-btn">Submit</button>
                    <button class="cancel-tab-btn red-btn">Cancel</button>
                </div>
                <ul class="link-list">
                    ${setup.urls.map((url, urlIndex) =>
            `<li>${url} <button class="remove-tab-btn red-btn" data-url-index="${urlIndex}">X</button></li>`
        ).join('')}
                </ul>
            </div>
        `;

        // Change zone color when a new color is selected from the dropdown
        li.querySelector('.color-dropdown').addEventListener('change', (e) => {
            const selectedColor = e.target.value;
            chrome.storage.sync.get('setups', (data) => {
                const setups = data.setups || [];
                setups[index].color = selectedColor;
                chrome.storage.sync.set({ setups }, () => {
                    li.querySelector('.zone').style.backgroundColor = selectedColor;
                });
            });
        });

        // Show the form to add a new tab
        li.querySelector('.add-tab-btn').addEventListener('click', () => {
            li.querySelector('.add-tab-form').style.display = 'block';
        });

        // Submit the new tab URL
        li.querySelector('.submit-tab-btn').addEventListener('click', () => {
            const url = li.querySelector('.tab-url').value;
            if (url) {
                chrome.storage.sync.get('setups', (data) => {
                    const setups = data.setups || [];
                    setups[index].urls.push(url);
                    chrome.storage.sync.set({ setups });
                    alert(`Added ${url} to ${setups[index].title}`);
                    location.reload();
                });
            }
        });

        // Cancel adding a tab
        li.querySelector('.cancel-tab-btn').addEventListener('click', () => {
            li.querySelector('.add-tab-form').style.display = 'none';
        });

        // Edit the setup title
        li.querySelector('.edit-btn').addEventListener('click', () => editSetup(index));

        // Delete the setup
        li.querySelector('.delete-btn').addEventListener('click', () => deleteSetup(index));

        // Add event listeners for each remove button
        li.querySelectorAll('.remove-tab-btn').forEach((button, urlIndex) => {
            button.addEventListener('click', (e) => {
                // Get the URL index from the data-url-index attribute
                const urlIndex = e.target.getAttribute('data-url-index');

                // Remove the URL from the setup.urls array
                setup.urls.splice(urlIndex, 1);

                // Save the updated setup array to chrome storage
                chrome.storage.sync.get('setups', (data) => {
                    const setups = data.setups || [];
                    setups[index] = setup;  // Update the current setup with the new URLs
                    chrome.storage.sync.set({ setups }, () => {
                        alert(`Removed Link.`);
                        location.reload(); // Reload the page to reflect changes
                    });
                });
            });
        });

        setupList.appendChild(li);
    });
});

// Add a new setup
addSetupBtn.addEventListener('click', () => {
    const title = prompt("Enter the module title:");
    if (title) {
        const newSetup = { title, urls: [], color: "#ffffff" };
        chrome.storage.sync.get('setups', (data) => {
            const setups = data.setups || [];
            setups.push(newSetup);
            chrome.storage.sync.set({ setups });
            location.reload();
        });
    }
});

// Edit the setup title
function editSetup(index) {
    chrome.storage.sync.get('setups', (data) => {
        const setups = data.setups || [];
        const newTitle = prompt("Edit the module title:", setups[index].title);
        setups[index].title = newTitle;
        chrome.storage.sync.set({ setups });
        location.reload();
    });
}

// Delete the setup
function deleteSetup(index) {
    chrome.storage.sync.get('setups', (data) => {
        const setups = data.setups || [];
        setups.splice(index, 1);
        chrome.storage.sync.set({ setups });
        location.reload();
    });
}

// Export the setups as a JSON file
exportBtn.addEventListener('click', () => {
    chrome.storage.sync.get('setups', (data) => {
        const setups = data.setups || [];
        const jsonBlob = new Blob([JSON.stringify(setups, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(jsonBlob);
        link.download = 'tabzones.json';
        link.click();
    });
});

// Import setups from a JSON file
importBtn.addEventListener('click', () => {
    importInput.click();  // Trigger the file input when the import button is clicked
});

importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedSetups = JSON.parse(event.target.result);
                if (Array.isArray(importedSetups)) {
                    chrome.storage.sync.set({ setups: importedSetups }, () => {
                        alert('Tabzones imported successfully!');
                        location.reload();  // Reload to show the imported setups
                    });
                } else {
                    alert('Invalid JSON file format!');
                }
            } catch (error) {
                alert('Error reading file!');
            }
        };
        reader.readAsText(file);
    }
});

// Initialize the theme based on the user's preference
function initializeTheme() {
    const isDark = localStorage.getItem("isDarkTheme") === "true";
    applyTheme(isDark);
}

// Initialize theme on load
initializeTheme();

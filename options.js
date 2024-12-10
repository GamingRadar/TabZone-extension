const setupList = document.getElementById('setupList');
const addSetupBtn = document.getElementById('addSetupBtn');

// Pre-defined color options
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

// Load setups from storage
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
            ${colorOptions.map(option => `<option value="${option.hex}" ${setup.color === option.hex ? 'selected' : ''}>${option.name}</option>`).join('')}
          </select>
          <button class="delete-btn red-btn">Delete</button>
        </div>
        <div class="add-tab-form" style="display:none;">
          <input type="text" class="tab-url" placeholder="Paste URL here..." />
          <button class="submit-tab-btn green-btn">Submit</button>
          <button class="cancel-tab-btn red-btn">Cancel</button>
        </div>
        <ul class="link-list">
          ${setup.urls.map(url => `<li>${url} <button class="remove-tab-btn red-btn">X</button></li>`).join('')}
        </ul>
      </div>
    `;

        // Add functionality to the dropdown to change zone color
        li.querySelector('.color-dropdown').addEventListener('change', (e) => {
            const selectedColor = e.target.value;
            chrome.storage.sync.get('setups', (data) => {
                const setups = data.setups || [];
                setups[index].color = selectedColor; // Update the color in storage
                chrome.storage.sync.set({ setups }, () => {
                    li.querySelector('.zone').style.backgroundColor = selectedColor; // Reflect the change in UI
                });
            });
        });

        // Other existing functionalities
        li.querySelector('.add-tab-btn').addEventListener('click', () => {
            li.querySelector('.add-tab-form').style.display = 'block';
        });

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

        li.querySelector('.cancel-tab-btn').addEventListener('click', () => {
            li.querySelector('.add-tab-form').style.display = 'none';
        });

        li.querySelector('.edit-btn').addEventListener('click', () => editSetup(index));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteSetup(index));

        setupList.appendChild(li);
    });
});

// Add New Setup
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

// Edit setup
function editSetup(index) {
    chrome.storage.sync.get('setups', (data) => {
        const setups = data.setups || [];
        const newTitle = prompt("Edit the module title:", setups[index].title);
        setups[index].title = newTitle;
        chrome.storage.sync.set({ setups });
        location.reload();
    });
}

// Delete setup
function deleteSetup(index) {
    chrome.storage.sync.get('setups', (data) => {
        const setups = data.setups || [];
        setups.splice(index, 1);
        chrome.storage.sync.set({ setups });
        location.reload();
    });
}


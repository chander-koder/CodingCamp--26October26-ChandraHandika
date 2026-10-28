// ============================================
// THEME MANAGEMENT
// ============================================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }
}

themeToggle.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
});

// ============================================
// GREETING & TIME
// ============================================
const greetingEl = document.getElementById('greeting');
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const nameDisplayEl = document.getElementById('nameDisplay');
const nameTextEl = document.getElementById('nameText');
const nameEditEl = document.getElementById('nameEdit');
const nameInputEl = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveName');

function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    currentTimeEl.textContent = `${hours}:${minutes}`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'Good Evening';
    } else {
        greeting = 'Good Night';
    }
    
    greetingEl.textContent = greeting;
}

function loadName() {
    const savedName = localStorage.getItem('userName') || 'there';
    nameTextEl.textContent = savedName;
}

nameDisplayEl.addEventListener('click', () => {
    nameEditEl.classList.remove('hidden');
    nameDisplayEl.classList.add('hidden');
    nameInputEl.value = nameTextEl.textContent === 'there' ? '' : nameTextEl.textContent;
    nameInputEl.focus();
});

saveNameBtn.addEventListener('click', () => {
    const newName = nameInputEl.value.trim() || 'there';
    nameTextEl.textContent = newName;
    localStorage.setItem('userName', newName);
    nameEditEl.classList.add('hidden');
    nameDisplayEl.classList.remove('hidden');
});

nameInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveNameBtn.click();
    }
});

// ============================================
// POMODORO TIMER
// ============================================
const timerDisplay = document.getElementById('timerDisplay');
const timerDurationInput = document.getElementById('timerDuration');
const startTimerBtn = document.getElementById('startTimer');
const stopTimerBtn = document.getElementById('stopTimer');
const resetTimerBtn = document.getElementById('resetTimer');

let timerInterval = null;
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
}

function startTimer() {
    if (timerInterval) return; // Already running
    
    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();
        
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            playTimerComplete();
            showNotification('Focus session complete! Take a break.');
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    const duration = parseInt(timerDurationInput.value) || 25;
    totalSeconds = duration * 60;
    remainingSeconds = totalSeconds;
    updateTimerDisplay();
}

function playTimerComplete() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Minimalist Dashboard', { body: message });
    }
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

startTimerBtn.addEventListener('click', startTimer);
stopTimerBtn.addEventListener('click', stopTimer);
resetTimerBtn.addEventListener('click', resetTimer);

timerDurationInput.addEventListener('change', () => {
    if (!timerInterval) { // Only update if timer is not running
        resetTimer();
    }
});

// ============================================
// TO-DO LIST
// ============================================
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const taskListEl = document.getElementById('taskList');

let tasks = [];

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask(text) {
    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function editTask(id, newText) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.text = newText;
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    taskListEl.innerHTML = '';
    
    if (tasks.length === 0) {
        taskListEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">No tasks yet. Add one above!</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 rounded-lg group hover:shadow-md transition-all';
        
        taskEl.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   class="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                   data-id="${task.id}">
            <span class="flex-1 ${task.completed ? 'line-through text-gray-400 dark:text-gray-600' : ''}" 
                  data-id="${task.id}">${task.text}</span>
            <button class="edit-btn opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded" data-id="${task.id}" title="Edit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
            </button>
            <button class="delete-btn opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 rounded" data-id="${task.id}" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        `;
        
        // Checkbox event
        const checkbox = taskEl.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            toggleTask(task.id);
        });
        
        // Edit button event
        const editBtn = taskEl.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            const newText = prompt('Edit task:', task.text);
            if (newText && newText.trim()) {
                editTask(task.id, newText.trim());
            }
        });
        
        // Delete button event
        const deleteBtn = taskEl.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Delete this task?')) {
                deleteTask(task.id);
            }
        });
        
        taskListEl.appendChild(taskEl);
    });
}

addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        addTask(text);
        taskInput.value = '';
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

// ============================================
// QUICK LINKS
// ============================================
const linkTitleInput = document.getElementById('linkTitle');
const linkUrlInput = document.getElementById('linkUrl');
const addLinkBtn = document.getElementById('addLink');
const linkListEl = document.getElementById('linkList');

let links = [];

function loadLinks() {
    const savedLinks = localStorage.getItem('quickLinks');
    links = savedLinks ? JSON.parse(savedLinks) : [];
    renderLinks();
}

function saveLinks() {
    localStorage.setItem('quickLinks', JSON.stringify(links));
}

function addLink(title, url) {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    const link = {
        id: Date.now(),
        title: title,
        url: url
    };
    links.push(link);
    saveLinks();
    renderLinks();
}

function deleteLink(id) {
    links = links.filter(link => link.id !== id);
    saveLinks();
    renderLinks();
}

function renderLinks() {
    linkListEl.innerHTML = '';
    
    if (links.length === 0) {
        linkListEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 py-4">No quick links yet. Add one above!</p>';
        return;
    }
    
    links.forEach(link => {
        const linkEl = document.createElement('div');
        linkEl.className = 'group relative';
        
        linkEl.innerHTML = `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center gap-2 px-4 py-3 bg-white dark:bg-neutral-800 rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-sm hover:shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span class="font-medium">${link.title}</span>
            </a>
            <button class="delete-link-btn absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center" 
                    data-id="${link.id}" title="Delete link">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        
        const deleteBtn = linkEl.querySelector('.delete-link-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm(`Delete link "${link.title}"?`)) {
                deleteLink(link.id);
            }
        });
        
        linkListEl.appendChild(linkEl);
    });
}

addLinkBtn.addEventListener('click', () => {
    const title = linkTitleInput.value.trim();
    const url = linkUrlInput.value.trim();
    
    if (title && url) {
        addLink(title, url);
        linkTitleInput.value = '';
        linkUrlInput.value = '';
    }
});

linkUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addLinkBtn.click();
    }
});

// ============================================
// INITIALIZATION
// ============================================
function init() {
    initTheme();
    loadName();
    updateTime();
    updateGreeting();
    loadTasks();
    loadLinks();
    updateTimerDisplay();
    
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Update greeting every minute
    setInterval(updateGreeting, 60000);
}

// Start the app
init();

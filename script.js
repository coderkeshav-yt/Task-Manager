document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const progress = document.getElementById('progress');
    const progressLabel = document.getElementById('progressLabel');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const taskCategory = document.getElementById('taskCategory');
    const inProgressList = document.getElementById('inProgressList');
    const doneList = document.getElementById('doneList');
    const taskDate = document.getElementById('taskDate');
    const sortOption = document.getElementById('sortOption');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Set default date to today
    taskDate.valueAsDate = new Date();

    function sortTasks(tasks) {
        const sortType = sortOption.value;
        
        return [...tasks].sort((a, b) => {
            switch (sortType) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
    }

    function renderTasks() {
        inProgressList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">assignment</span>
                <p>No tasks in progress</p>
                <span class="empty-state-subtitle">Add a new task to get started!</span>
            </div>
        `;
        doneList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">task_alt</span>
                <p>No tasks completed</p>
                <span class="empty-state-subtitle">Complete tasks to see them here!</span>
            </div>
        `;
        
        let inProgressTasks = tasks.filter(task => !task.completed);
        let completedTasks = tasks.filter(task => task.completed);

        // Sort the tasks
        inProgressTasks = sortTasks(inProgressTasks);
        completedTasks = sortTasks(completedTasks);

        if (inProgressTasks.length > 0) {
            inProgressList.innerHTML = '';
        }
        
        if (completedTasks.length > 0) {
            doneList.innerHTML = '';
        }
        
        // Render in-progress tasks
        inProgressTasks.forEach((task, index) => {
            const taskIndex = tasks.findIndex(t => t === task);
            renderTask(task, taskIndex, inProgressList);
        });

        // Render completed tasks
        completedTasks.forEach((task, index) => {
            const taskIndex = tasks.findIndex(t => t === task);
            renderTask(task, taskIndex, doneList);
        });

        updateProgress();
    }

    function renderTask(task, index, container) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task ${task.completed ? 'completed' : ''}`;
        taskDiv.innerHTML = `
            <div class="task-content">
                <span class="task-name">
                    ${task.category === 'Urgent' ? '🚨 ' : ''}${task.name}
                </span>
                <div class="task-details">
                    <span class="task-category">
                        ${getCategoryIcon(task.category)} ${task.category}
                    </span>
                    <span class="task-date">
                        <span class="material-icons">event</span>
                        ${formatDate(task.date)}
                    </span>
                </div>
            </div>
            <div class="task-buttons">
                ${!task.completed ? `
                    <button class="complete-btn" onclick="toggleComplete(${index})" title="Mark Complete">
                        <span class="material-icons">check_circle_outline</span>
                    </button>
                    <button class="edit-btn" onclick="editTask(${index})" title="Edit Task">
                        <span class="material-icons">edit</span>
                    </button>
                ` : `
                    <span class="completed-badge">
                        <span class="material-icons">task_alt</span>
                        Completed
                    </span>
                `}
                <button class="delete-btn" onclick="deleteTask(${index})" title="Delete Task">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        container.appendChild(taskDiv);
    }

    function getCategoryIcon(category) {
        switch(category) {
            case 'Work': return '💼';
            case 'Personal': return '👤';
            case 'Urgent': return '🚨';
            case 'Custom': return '✨';
            case 'Study': return '📚';
            default: return '';
        }
    }

    function updateProgress() {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progress.style.width = `${progressPercentage}%`;
        progressLabel.innerText = `${Math.round(progressPercentage)}% Tasks Completed`;

        // Trigger confetti and celebratory message when progress is 100%
        if (progressPercentage === 100) {
            showConfetti();
            progressLabel.innerText = "🎉 100% Tasks Completed! 🎉";
            
            // Show the celebratory message
            const celebrationMessage = document.getElementById('celebrationMessage');
            celebrationMessage.style.display = 'block'; // Show the message
            celebrationMessage.style.opacity = '1'; // Fade in the message

            // Hide the message after a few seconds
            setTimeout(() => {
                celebrationMessage.style.opacity = '0'; // Fade out the message
                setTimeout(() => {
                    celebrationMessage.style.display = 'none'; // Hide the message completely
                }, 500); // Wait for the fade-out to complete
            }, 3000); // Show for 3 seconds
        }
    }

    function showConfetti() {
        const sound = document.getElementById('celebrationSound');
        sound.play(); // Play the sound effect
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            document.body.appendChild(confetti);
            
            // Create fireworks
            const firework = document.createElement('div');
            firework.classList.add('firework');
            firework.style.left = `${Math.random() * 100}vw`; // Random horizontal position
            firework.style.animationDuration = `${Math.random() * 1 + 0.5}s`; // Random duration
            document.body.appendChild(firework);
            
            // Remove confetti and fireworks after animation
            setTimeout(() => {
                confetti.remove();
                firework.remove();
            }, 2000);
        }
    }

    window.toggleComplete = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    };

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    window.editTask = (index) => {
        const task = tasks[index];
        taskInput.value = task.name;
        taskCategory.value = task.category;
        taskDate.value = task.date;
        addTaskButton.innerText = 'Update Task';
        
        addTaskButton.onclick = () => {
            const updatedTaskName = taskInput.value;
            const updatedCategory = taskCategory.value;
            const updatedDate = taskDate.value;
            if (updatedTaskName) {
                tasks[index] = { 
                    name: updatedTaskName, 
                    completed: task.completed, 
                    category: updatedCategory,
                    date: updatedDate 
                };
                taskInput.value = '';
                taskDate.valueAsDate = new Date(); // Reset to today
                addTaskButton.innerText = 'Add Task';
                saveTasks();
                renderTasks();
            }
        };
    };

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function showNotification(message) {
        const toast = document.getElementById('notificationToast');
        toast.innerText = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000); // Show for 3 seconds
    }

    addTaskButton.addEventListener('click', () => {
        const taskName = taskInput.value;
        const category = taskCategory.value;
        const date = taskDate.value;
        if (taskName) {
            tasks.push({ 
                name: taskName, 
                completed: false, 
                category,
                date: date 
            });
            taskInput.value = '';
            taskDate.valueAsDate = new Date(); // Reset to today
            saveTasks();
            renderTasks();
            showNotification('Task Added!');
        }
    });

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Add sort change event listener
    sortOption.addEventListener('change', () => {
        renderTasks();
    });

    renderTasks();
});

// Add a helper function to format the date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
} 
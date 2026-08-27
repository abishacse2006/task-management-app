async function registerUser() {
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    const response = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    alert(data.message || data.error);
}

async function loginUser() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Login successful!");
    } else {
        alert(data.error);
    }
}

async function loadTasks() {
    try {
        const response = await fetch("/api/tasks");
        const tasks = await response.json();

        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";

        tasks.forEach(task => displayTask(task));

    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

async function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (title === "") {
        alert("Please enter a task");
        return;
    }

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title })
        });

        const data = await response.json();

        displayTask(data.task);
        input.value = "";

    } catch (error) {
        console.error("Error adding task:", error);
    }
}

function displayTask(task) {
    const li = document.createElement("li");
    li.className = "task";

    li.innerHTML = `
        <span>${task.title}</span>

        <div>
            <button onclick="editTask('${task._id}', '${task.title}')">
                Edit
            </button>

            <button onclick="completeTask(this)">
                Complete
            </button>

            <button class="delete-btn"
                onclick="deleteTask('${task._id}')">
                Delete
            </button>
        </div>
    `;

    document.getElementById("taskList").appendChild(li);
}

async function editTask(id, oldTitle) {
    const newTitle = prompt("Edit task:", oldTitle);

    if (newTitle === null || newTitle.trim() === "") {
        return;
    }

    await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: newTitle.trim()
        })
    });

    loadTasks();
}

function completeTask(button) {
    const task = button.parentElement.parentElement;
    const text = task.querySelector("span");

    text.style.textDecoration = "line-through";
    text.style.opacity = "0.5";

    button.disabled = true;
    button.textContent = "Completed";
}

async function deleteTask(id) {
    await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

loadTasks();
function logoutUser() {
    localStorage.removeItem("loggedInUser");

    document.getElementById("taskSection").style.display = "none";
    document.getElementById("authSection").style.display = "block";

    alert("Logged out successfully");
}
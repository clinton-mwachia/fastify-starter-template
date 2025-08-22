document.addEventListener("DOMContentLoaded", async () => {
  await loadUsers();
  loadTodos();
  loadUsersToDisplay();
});

// a modal to open and close the forms
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Close modal when clicking outside content
window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};

/** TODOS FUNCTIONS */
// a function to load all users
async function loadTodos() {
  const response = await fetch("http://127.0.0.1:4050/todos");
  const todos = await response.json();
  const todoList = document.getElementById("todo-list");

  todoList.innerHTML = "";

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty-label");
    empty.textContent = "No todos available";
    todoList.appendChild(empty);
    return;
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.setAttribute("data-id", todo._id);
    li.innerHTML = `
      <span>${todo && todo.title}</span>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;
    todoList.appendChild(li);
  });
}

document.getElementById("todo-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.getElementById("todo-input");
  const userSelect = document.getElementById("user-select");
  const prioritySelect = document.getElementById("priority-select");
  const fileInput = document.getElementById("file-input");

  const title = input.value.trim();
  const user = userSelect.value;
  const priority = prioritySelect.value;
  const file = fileInput.files;

  if (!title || !user || !priority) return;

  const formData = new FormData();
  formData.append("title", title);
  formData.append("user", user);
  formData.append("priority", priority);
  formData.append("files", file);

  try {
    const response = await fetch("http://127.0.0.1:4050/todo/register", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // reset form
    input.value = "";
    userSelect.value = "";
    prioritySelect.value = "";
    fileInput.value = "";

    loadTodos();
  } catch (err) {
    console.error("Error adding todo:", err);
    alert("Failed to add todo. Please try again.");
  }
});

document.getElementById("todo-list").addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete")) {
    const id = e.target.parentElement.getAttribute("data-id");
    const response = await fetch(`http://127.0.0.1:4050/todo/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadTodos();
    }
  } else if (e.target.classList.contains("edit")) {
    const id = e.target.parentElement.getAttribute("data-id");
    const newText = prompt(
      "Edit todo:",
      e.target.previousElementSibling.textContent
    );

    if (newText) {
      const response = await fetch(`http://127.0.0.1:4050/todo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newText }),
      });

      if (response.ok) {
        loadTodos();
      }
    }
  }
});

/* USERS FUNCTIONS */
// a function to load users to display in the todos dropdown
async function loadUsers() {
  const response = await fetch("http://127.0.0.1:4050/users");
  const users = await response.json();
  const userSelect = document.getElementById("user-select");

  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user._id;
    option.textContent = user.username;
    userSelect.appendChild(option);
  });
}
// a function to load users to display in the users tabs
async function loadUsersToDisplay() {
  const response = await fetch("http://127.0.0.1:4050/users");
  const users = await response.json();
  const userList = document.getElementById("user-list");

  userList.innerHTML = "";

  if (users.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty-label");
    empty.textContent = "No users available";
    userList.appendChild(empty);
    return;
  }

  users.forEach((user) => {
    const li = document.createElement("li");
    li.setAttribute("data-id", user._id);
    li.innerHTML = `
      <span>${user.username}</span>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;
    userList.appendChild(li);
  });
}

document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role").value;
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username && role && phone && password) {
    const response = await fetch("http://127.0.0.1:4050/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, role, phone, password }),
    });

    if (response.ok) {
      document.getElementById("user-form").reset();
      loadUsersToDisplay();
    }
  }
});

document.getElementById("user-list").addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete")) {
    const id = e.target.parentElement.getAttribute("data-id");
    const response = await fetch(`http://127.0.0.1:4050/user/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadUsersToDisplay();
    }
  } else if (e.target.classList.contains("edit")) {
    const id = e.target.parentElement.getAttribute("data-id");
    const newText = prompt(
      "Edit user:",
      e.target.previousElementSibling.textContent
    );

    if (newText) {
      const response = await fetch(`http://127.0.0.1:4050/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newText }),
      });

      if (response.ok) {
        loadUsersToDisplay();
      }
    }
  }
});

/** TABS HELPER FUNCTIONS */
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// OPEN USERS TAB BY DEFAULT
document.getElementById("defaultOpen").click();

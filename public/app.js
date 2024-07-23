document.addEventListener("DOMContentLoaded", async () => {
  await loadUsers();
  await loadTodos();
});

async function loadTodos() {
  const response = await fetch("http://127.0.0.1:4050/todos");
  const todos = await response.json();
  const todoList = document.getElementById("todo-list");

  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.setAttribute("data-id", todo._id);
    li.innerHTML = `
      <span>${todo && todo.title} - ${todo && todo.priority} - ${
      todo.user && todo.user.username
    }</span>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;
    todoList.appendChild(li);
  });
}

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

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
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

  if (title && user && priority) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("user", user);
    formData.append("priority", priority);
    formData.append("files", file);

    const response = await fetch("http://127.0.0.1:4050/todo/register", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      input.value = "";
      userSelect.value = "";
      prioritySelect.value = "";
      fileInput.value = "";
      loadTodos();
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// src/client/taskManager.ts
class TaskManager {
  apiUrl = "/api";
  form;
  tasksList;
  loading;
  error;
  constructor() {
    this.form = document.getElementById("addTaskForm");
    this.tasksList = document.getElementById("tasksList");
    this.loading = document.getElementById("loading");
    this.error = document.getElementById("error");
    this.init();
  }
  init() {
    this.form.addEventListener("submit", this.handleTaskAdd.bind(this));
    this.loadtasks();
  }
  async handleTaskAdd(e) {
    e.preventDefault();
    const formData = new FormData(this.form);
    const taskData = {
      title: formData.get("task-name"),
      finish_by: formData.get("task-finishBy")
    };
    try {
      console.log(`creating: ${JSON.stringify(taskData)}`);
      const response = await fetch(`${this.apiUrl}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        this.form.reset();
        this.loadtasks();
        this.showSuccess("task added successfully!");
      } else {
        const errorData = await response.json();
        this.showError(errorData.error || "Failed to add task");
      }
    } catch (error) {
      this.showError("Network error. Please try again.");
      console.error("Error:", error);
    }
  }
  async loadtasks() {
    this.loading.style.display = "block";
    this.error.style.display = "none";
    try {
      const response = await fetch(`${this.apiUrl}/tasks`);
      if (response.ok) {
        const tasks = await response.json();
        this.rendertasks(tasks);
      } else {
        this.showError("Failed to load tasks");
      }
    } catch (error) {
      this.showError("Network error. Please try again.");
      console.error("Error:", error);
    } finally {
      this.loading.style.display = "none";
    }
  }
  async handleClicks(e, task) {
    if (!task)
      return;
    const target = e.target;
    switch (target.id) {
      case "btn-edit":
        await this.handleEditStart(e, task);
        break;
      case "btn-cancel":
        await this.handleEditCancel(e, task);
        break;
      case "btn-save":
        await this.handleEditSave(e, task);
        break;
      case "btn-delete":
        await this.handleTaskDelete(e, task);
        break;
      case "btn-done":
        await this.handleTaskDone(e, task);
        break;
      default:
        break;
    }
  }
  async handleEditStart(e, task) {
    const cardArea = e.currentTarget;
    if (!cardArea)
      return;
    const editArea = cardArea.querySelector(`#edit-area`);
    if (!editArea)
      return;
    const finishDate = task.finish_by !== "NULL" ? new Date(task.finish_by).toISOString().split("T")[0] : "";
    const editForm = document.createElement("form");
    editForm.id = "editTaskForm";
    editForm.innerHTML = `
        <div class="form-group">
          <label for="edit-task-name">Task Name:</label>
          <input type="text" id="edit-task-name" name="edit-task-name" required value="${this.escapeHtml(task.title)}">
        </div>
        <div class="form-group">
          <label for="edit-task-finishBy">Finish By:</label>
          <input type="date" id="edit-task-finishBy" name="edit-task-finishBy" value="${finishDate}">
        </div>
        <button type="button" id="btn-cancel" class="btn-cancel">Cancel</button>
        <button type="button" id="btn-save" class="btn-save">Save</button>
    `;
    editArea.replaceChildren(editForm);
  }
  async handleEditCancel(e, task) {
    const cardArea = e.currentTarget;
    if (!cardArea)
      return;
    const editArea = cardArea.querySelector(`#edit-area`);
    if (!editArea)
      return;
    editArea.innerHTML = "";
  }
  async handleEditSave(e, task) {
    const cardArea = e.currentTarget;
    if (!cardArea)
      return;
    const editForm = cardArea.querySelector(`#editTaskForm`);
    if (!editForm)
      return;
    const formData = new FormData(editForm);
    const taskData = {
      id: task.id,
      title: formData.get("edit-task-name"),
      finish_by: formData.get("edit-task-finishBy")
    };
    try {
      const response = await fetch(`${this.apiUrl}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        this.loadtasks();
        this.showSuccess(`task ${task.title} updated!`);
      } else {
        this.showError("Failed to update task");
      }
    } catch (error) {
      this.showError("Network error. Please try again.");
      console.error("Error:", error);
    } finally {
      this.handleEditCancel(e, task);
    }
  }
  async handleTaskDelete(e, task) {
    try {
      const response = await fetch(`${this.apiUrl}/tasks/${task.id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        this.loadtasks();
        this.showSuccess(`task ${task.title} deleted!`);
      } else {
        this.showError("Failed to delete task");
      }
    } catch (error) {
      this.showError("Network error. Please try again.");
      console.error("Error:", error);
    }
  }
  async handleTaskDone(e, task) {
    try {
      const response = await fetch(`${this.apiUrl}/tasks/${task.id}/done`, {
        method: "POST"
      });
      if (response.ok) {
        this.loadtasks();
        this.showSuccess(`task ${task.title} marked as done!`);
      } else {
        this.showError("Failed to mark task as done");
      }
    } catch (error) {
      this.showError("could not set task as done. Please try again.");
      console.error("Error:", error);
    }
  }
  rendertasks(tasks) {
    if (tasks.length === 0) {
      this.tasksList.innerHTML = "<p>No tasks found. Add some tasks to get started!</p>";
      return;
    }
    this.tasksList.replaceChildren(...tasks.map((task) => {
      const createDate = new Date(task.created_at).toLocaleDateString();
      const finishDate = task.finish_by !== "NULL" ? new Date(task.finish_by).toLocaleDateString() : "";
      const completedDate = task.completed_at ? new Date(task.completed_at).toLocaleDateString() : "";
      const taskCard = document.createElement("div");
      taskCard.className = "task-card";
      taskCard.addEventListener("click", (e) => this.handleClicks(e, task));
      taskCard.innerHTML = `
        <div>
          <div class="task-name">${this.escapeHtml(task.title)}</div>
          <div class="task-finish-by">Finish by: ${this.escapeHtml(finishDate)}</div>
          ${completedDate ? `<div class="task-completed-at">Completed at: ${this.escapeHtml(completedDate)}</div>` : ""}
          <div class="task-date">Added: ${createDate}</div>
        </div>
        <div>
          <div class="task-buttons">
            <button id="btn-edit" class="btn-task btn-edit">Edit</button>
            <button id="btn-delete" class="btn-task btn-delete">Delete</button>
            <button id="btn-done" class="btn-task btn-done">Done</button>
          </div>
          <div id="edit-area" class="edit-area"></div>
        </div>
      `;
      return taskCard;
    }));
  }
  showError(message) {
    this.error.textContent = message;
    this.error.style.display = "block";
    setTimeout(() => {
      this.error.style.display = "none";
    }, 5000);
  }
  showSuccess(message) {
    let success = document.querySelector(".success");
    if (!success) {
      success = document.createElement("div");
      success.className = "success";
      this.error.parentNode?.insertBefore(success, this.error);
    }
    success.textContent = message;
    success.style.display = "block";
    setTimeout(() => {
      success.style.display = "none";
    }, 3000);
  }
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// src/client/app.ts
document.addEventListener("DOMContentLoaded", () => {
  new TaskManager;
});

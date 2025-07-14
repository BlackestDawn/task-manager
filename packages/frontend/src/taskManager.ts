import type {
  TaskItem,
  CreateTaskRequest,
  UpdateTaskRequest,
  ApiErrorResponse
} from "@task-manager/common";
import { isOverdue, isThisWeek, isThisMonth, dateSort, elementNullCheck, justDate } from "./utils";

export default class TaskManager {
  private apiUrl: string ;
  private form: HTMLFormElement;
  private tasksListWeek: HTMLDivElement;
  private tasksListMonth: HTMLDivElement;
  private tasksListRest: HTMLDivElement;
  private loading: HTMLDivElement;
  private error: HTMLDivElement;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || '/api';
    this.form = elementNullCheck<HTMLFormElement>('#addTaskForm');
    this.tasksListWeek = elementNullCheck<HTMLDivElement>('#tasksListWeek');
    this.tasksListMonth = elementNullCheck<HTMLDivElement>('#tasksListMonth');
    this.tasksListRest = elementNullCheck<HTMLDivElement>('#tasksListRest');
    this.loading = elementNullCheck<HTMLDivElement>('#loading');
    this.error = elementNullCheck<HTMLDivElement>('#error');

    this.init();
  }

  private init(): void {
    const addTaskButton = elementNullCheck<HTMLButtonElement>('#btn-add-task');
    addTaskButton.addEventListener('click', this.handleTaskAdd.bind(this));
    this.loadtasks();
  }

  private async handleTaskAdd(e: Event): Promise<void> {
    e.preventDefault();

    const formData = new FormData(this.form);
    const taskName = formData.get('task-name') as string;
    const taskFinishBy = formData.get('task-finishBy') as string;
    const taskData: CreateTaskRequest = {
      title: taskName,
      finishBy: taskFinishBy ? new Date(taskFinishBy) : undefined
    };

    try {
      console.log(`creating: ${JSON.stringify(taskData)}`);
      const response = await fetch(`${this.apiUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        this.form.reset();
        this.loadtasks();
        this.showSuccess('task added successfully!');
      } else {
        const errorData: ApiErrorResponse = await response.json();
        this.showError(errorData.error || 'Failed to add task');
      }
    } catch (error) {
      this.showError(`Network error. Please try again.`);
      console.error('Error:', error);
    }
  }

  private async loadtasks(): Promise<void> {
    this.loading.style.display = 'block';
    this.error.style.display = 'none';

    try {
      const response = await fetch(`${this.apiUrl}/tasks`);

      if (response.ok) {
        const tasks: TaskItem[] = await response.json();
        this.rendertasks(tasks);
      } else {
        this.showError('Failed to load tasks');
      }
    } catch (error) {
      this.showError(`Network error. Please try again.`);
      console.error('Error:', error);
    } finally {
      this.loading.style.display = 'none';
    }
  }

  private async handleCardClicks(e: Event, task: TaskItem): Promise<void> {
    if (!task) return;
    const eventGen = e.target as HTMLElement;
    const eventCatcher = e.currentTarget as HTMLElement;
    if (!eventGen || !eventCatcher) return;

    switch (eventGen.id) {
      case 'btn-edit':
        this.handleEditStart(task, eventCatcher);
        break;
      case 'btn-cancel':
        this.handleEditCancel(eventCatcher);
        break;
      case 'btn-save':
        await this.handleEditSave(task, eventCatcher);
        break;
      case 'btn-delete':
        await this.handleTaskDelete(task);
        break;
      case 'btn-done':
        await this.handleTaskDone(task);
        break;
      default:
        break;
      }
  }

  private handleEditStart(task: TaskItem, eventCatcher: HTMLElement): void {
    const editArea = elementNullCheck<HTMLDivElement>(`#task-edit-area`, eventCatcher);
    editArea.replaceChildren(this.buildEditArea(task));
  }

  private handleEditCancel(eventCatcher: HTMLElement): void {
    const editArea = elementNullCheck<HTMLDivElement>(`#task-edit-area`, eventCatcher);
    editArea.innerHTML = '';
  }

  private async handleEditSave(task: TaskItem, eventCatcher: HTMLElement): Promise<void> {
    const editForm = elementNullCheck<HTMLFormElement>(`#editTaskForm`, eventCatcher);

    const formData = new FormData(editForm);
    const taskName = formData.get('edit-task-name') as string;
    const taskFinishBy = formData.get('edit-task-finishBy') as string;
    const taskData: UpdateTaskRequest = {
      id: task.id,
      title: taskName,
      finishBy: taskFinishBy ? new Date(taskFinishBy) : undefined
    };

    try {
      const response = await fetch(`${this.apiUrl}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        this.loadtasks();
        this.showSuccess(`task ${task.title} updated!`);
      } else {
        this.showError('Failed to update task');
      }
    } catch (error) {
      this.showError("Network error. Please try again.");
      console.error('Error:', error);
    } finally {
      this.handleEditCancel(eventCatcher);
    }
  }

  private async handleTaskDelete(task: TaskItem): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/tasks/${task.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.loadtasks();
        this.showSuccess(`task ${task.title} deleted!`);
      } else {
        this.showError('Failed to delete task');
      }
    } catch (error) {
      this.showError("Network error. Please try again.");
      console.error('Error:', error);
    }
  }

  private async handleTaskDone(task: TaskItem): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/tasks/${task.id}/done`, {
        method: 'POST'
      });

      if (response.ok) {
        this.loadtasks();
        this.showSuccess(`task ${task.title} marked as done!`);
      } else {
        this.showError('Failed to mark task as done');
      }
    } catch (error) {
      this.showError("could not set task as done. Please try again.");
      console.error('Error:', error);
    }
  }

  private rendertasks(tasks: TaskItem[]): void {
    if (tasks.length === 0) {
      this.tasksListRest.innerHTML = '<p>No tasks found. Add some tasks to get started!</p>';
      return;
    }

    this.tasksListWeek.replaceChildren(...tasks.filter(isThisWeek).sort(dateSort).map(this.buildCardItem.bind(this)));
    this.tasksListMonth.replaceChildren(...tasks.filter(isThisMonth).sort(dateSort).map(this.buildCardItem.bind(this)));
    this.tasksListRest.replaceChildren(...tasks.filter(task => !isOverdue(task) && !isThisWeek(task) && !isThisMonth(task)).sort(dateSort).map(this.buildCardItem.bind(this)));
  }

  private buildCardItem(task: TaskItem): HTMLDivElement {
    console.log(`task: ${JSON.stringify(task)}`);

    const createDate = justDate(task.createdAt);
    const finishDate = task.finishBy ? justDate(task.finishBy) : 'Undetermined';
    const completedDate = task.completedAt ? justDate(task.completedAt) : '';
    const taskCard = document.createElement('div');
    if (task.completed) {
      taskCard.className = 'task-card task-completed';
    } else {
      taskCard.className = 'task-card';
    }
    taskCard.addEventListener('click', (e) => this.handleCardClicks(e, task));
    taskCard.innerHTML = `
        <div class="task-info">
          <div class="task-status ${isOverdue(task) && !task.completed ? 'task-overdue' : ''}">${isOverdue(task) && !task.completed ? 'Overdue' : ''}${task.completed ? 'Done' : ''}</div>
          <div class="task-name">${task.title}</div>
        </div>
        <div class="task-dates">
          <div class="task-date">Added: ${createDate}</div>
          <div class="task-finish-by">Finish by: ${finishDate}</div>
          <div class="task-completed-at">${ completedDate ? `Completed on: ${completedDate}` : ''}</div>
        </div>
        <div class="task-buttons">
          <button type="button" id="btn-edit" class="btn-task btn-edit">Edit</button>
          <button type="button" id="btn-done" class="btn-task btn-done">Done</button>
          <button type="button" id="btn-delete" class="btn-task btn-delete">Delete</button>
        </div>
        <div id="task-edit-area" class="task-edit-area"></div>
    `;
    return taskCard;
  }

  private buildEditArea(task: TaskItem): HTMLFormElement {
    const finishDate = task.finishBy ? justDate(task.finishBy) : '';
    const editForm = document.createElement('form') as HTMLFormElement;
    editForm.id = 'editTaskForm';

    editForm.innerHTML = `
        <div class="form-group">
          <label for="edit-task-name">Task Name:</label>
          <input type="text" id="edit-task-name" name="edit-task-name" required value="${task.title}">
        </div>
        <div class="form-group">
          <label for="edit-task-finishBy">Finish By:</label>
          <input type="date" id="edit-task-finishBy" name="edit-task-finishBy" value="${finishDate}">
        </div>
        <button type="button" id="btn-cancel" class="btn-task btn-cancel">Cancel</button>
        <button type="button" id="btn-save" class="btn-task btn-save">Save</button>
    `;

    return editForm;
  }

  private showError(message: string): void {
    this.error.textContent = message;
    this.error.style.display = 'block';
    setTimeout(() => {
      this.error.style.display = 'none';
    }, 5000);
  }

  private showSuccess(message: string): void {
    // Create success element if it doesn't exist
    let success = document.querySelector('.success') as HTMLElement;
    if (!success) {
      success = document.createElement('div');
      success.className = 'success';
      this.error.parentNode?.insertBefore(success, this.error);
    }

    success.textContent = message;
    success.style.display = 'block';
    setTimeout(() => {
      success.style.display = 'none';
    }, 3000);
  }
}

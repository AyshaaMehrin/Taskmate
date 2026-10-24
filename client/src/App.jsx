import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/assignments`;

const normalizeTask = (task) => ({
  ...task,
  id: task._id || task.id,
  dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
});

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    subject: "",
    dueDate: "",
    priority: "Medium",
  });

  const [form, setForm] = useState({
    title: "",
    subject: "",
    dueDate: "",
    priority: "Medium",
  });

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(API_URL);
        setTasks(
          (response.data.assignments || []).map((task) => normalizeTask(task))
        );
        setError("");
      } catch {
        setError(
          "Could not load assignments. Check that your backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const isOverdue = (task) =>
    task.dueDate && task.dueDate < today && task.status !== "Completed";

  const filteredTasks = tasks.filter((task) => {
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch =
      String(task.title || "").toLowerCase().includes(searchTerm) ||
      String(task.subject || "").toLowerCase().includes(searchTerm);

    const matchesFilter =
      filter === "All" ||
      (filter === "Overdue" && isOverdue(task)) ||
      task.status === filter;

    return matchesSearch && matchesFilter;
  });

  const addTask = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(API_URL, {
        ...form,
        status: "Pending",
      });

      const newTask = normalizeTask(response.data.assignment);

      setTasks((previousTasks) => [newTask, ...previousTasks]);
      setForm({
        title: "",
        subject: "",
        dueDate: "",
        priority: "Medium",
      });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save assignment. Please try again."
      );
    }
  };

  const changeStatus = async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { status });
      const updatedTask = normalizeTask(response.data.assignment);

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        )
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update assignment status. Please try again."
      );
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title || "",
      subject: task.subject || "",
      dueDate: task.dueDate || "",
      priority: task.priority || "Medium",
    });
    setError("");
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditForm({
      title: "",
      subject: "",
      dueDate: "",
      priority: "Medium",
    });
  };

  const saveTask = async (event, id) => {
    event.preventDefault();
    const updatedDetails = {
      title: editForm.title.trim(),
      subject: editForm.subject.trim(),
      dueDate: editForm.dueDate,
      priority: editForm.priority,
    };

    if (!updatedDetails.title || !updatedDetails.subject || !updatedDetails.dueDate) {
      setError("Title, subject, and due date are required.");
      return;
    }

    try {
      const response = await axios.patch(`${API_URL}/${id}`, updatedDetails);
      const updatedTask = normalizeTask(response.data.assignment);

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        )
      );
      cancelEditing();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save assignment changes. Please try again."
      );
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete assignment. Please try again."
      );
    }
  };

  const pending = tasks.filter((task) => task.status === "Pending").length;
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const overdue = tasks.filter(isOverdue).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">TaskMate<span>.</span></h2>

        <p className="menu-label">WORKSPACE</p>

        <div className="nav-item active">▦ Dashboard</div>
        <div className="nav-item">▤ My Assignments</div>
        <div className="nav-item">✓ Completed Tasks</div>

        <div className="sidebar-bottom">
          <div className="avatar">S</div>
          <div>
            <strong>Student</strong>
            <p>My Workspace</p>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>My Dashboard</h1>
          </div>

          <button
            className="primary-btn"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Assignment
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="welcome-tag">YOUR STUDY SPACE</p>
            <h2>Stay organized. Stay ahead. ✨</h2>
            <p>Keep track of your assignments and make every deadline.</p>
          </div>
          <div className="welcome-icon">📚</div>
        </section>

        {error && <div className="error-banner">{error}</div>}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total Assignments</p>
            <h2>{tasks.length}</h2>
            <span>All your tasks</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Pending</p>
            <h2>{pending}</h2>
            <span>Waiting to be done</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Completed</p>
            <h2>{completed}</h2>
            <span>Great work!</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">!</div>
            <p>Overdue</p>
            <h2>{overdue}</h2>
            <span>Need your attention</span>
          </div>
        </section>

        {showForm && (
          <section className="form-card">
            <h2>Add a new assignment</h2>

            <form onSubmit={addTask}>
              <label>
                Assignment title
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Complete Java assignment"
                />
              </label>

              <label>
                Subject
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Java Programming"
                />
              </label>

              <label>
                Due date
                <input
                  required
                  type="date"
                  min={today}
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </label>

              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="primary-btn" type="submit">
                  Save Assignment
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="assignments">
          <div className="section-heading">
            <div>
              <h2>My Assignments</h2>
              <p>Manage your upcoming academic work.</p>
            </div>
          </div>

          <div className="toolbar">
            <input
              className="search"
              placeholder="Search assignments or subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>

          <div className="task-list">
            {loading ? (
              <div className="empty-state">
                <span>⏳</span>
                <h3>Loading assignments...</h3>
              </div>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <article className="task-card">
                    <div className="task-check">
                      {task.status === "Completed" ? "✓" : "○"}
                    </div>

                    <div className="task-details">
                      <h3>{task.title}</h3>
                      <p>{task.subject}</p>
                      <span className="due-date">Due: {task.dueDate}</span>
                    </div>

                    <div className="task-controls">
                      <span className={`priority ${(task.priority || "Medium").toLowerCase()}`}>
                        {task.priority || "Medium"}
                      </span>

                      {isOverdue(task) && (
                        <span className="status overdue-status">Overdue</span>
                      )}

                      <select
                        aria-label={`Status for ${task.title || "assignment"}`}
                        value={task.status}
                        onChange={(e) => changeStatus(task.id, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => startEditing(task)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete ${task.title || "assignment"}`}
                        title="Delete assignment"
                      >
                        🗑
                      </button>
                    </div>
                  </article>

                  {editingTaskId === task.id && (
                    <section className="form-card assignment-edit-form">
                      <h2>Edit assignment</h2>
                      <form onSubmit={(event) => saveTask(event, task.id)}>
                        <label>
                          Assignment title
                          <input
                            required
                            value={editForm.title}
                            onChange={(event) =>
                              setEditForm({ ...editForm, title: event.target.value })
                            }
                          />
                        </label>

                        <label>
                          Subject
                          <input
                            required
                            value={editForm.subject}
                            onChange={(event) =>
                              setEditForm({ ...editForm, subject: event.target.value })
                            }
                          />
                        </label>

                        <label>
                          Due date
                          <input
                            required
                            type="date"
                            value={editForm.dueDate}
                            onChange={(event) =>
                              setEditForm({ ...editForm, dueDate: event.target.value })
                            }
                          />
                        </label>

                        <label>
                          Priority
                          <select
                            value={editForm.priority}
                            onChange={(event) =>
                              setEditForm({ ...editForm, priority: event.target.value })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </label>

                        <div className="form-actions">
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                          <button className="primary-btn" type="submit">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </section>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>📝</span>
                <h3>No assignments found</h3>
                <p>Try another search or add a new assignment.</p>
              </div>
            )}
          </div>
        </section>

        <footer>Made for students, one task at a time. 💜</footer>
      </main>
    </div>
  );
}

export default App;

const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// GET all assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve assignments",
    });
  }
});

// POST a new assignment
router.post("/", async (req, res) => {
  try {
    const { title, subject, description, dueDate, priority, status } = req.body;

    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, and due date are required",
      });
    }

    const assignment = await Assignment.create({
      title,
      subject,
      description,
      dueDate,
      priority,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment data",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
});

// PATCH: Update assignment details without changing its status
router.patch("/:id", async (req, res) => {
  const { title, subject, dueDate, priority } = req.body || {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof subject !== "string" ||
    !subject.trim() ||
    !dueDate ||
    Number.isNaN(new Date(dueDate).getTime()) ||
    !["Low", "Medium", "High"].includes(priority)
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid title, subject, due date, and priority are required",
    });
  }

  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        subject: subject.trim(),
        dueDate,
        priority,
      },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment details updated",
      assignment,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment details",
      });
    }

    res.status(500).json({
      success: false,
      message: "Could not update assignment details",
    });
  }
});

// PUT: Update assignment status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment status",
      });
    }

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment status updated",
      assignment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not update assignment status",
    });
  }
});

// DELETE an assignment
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not delete assignment",
    });
  }
});

module.exports = router;
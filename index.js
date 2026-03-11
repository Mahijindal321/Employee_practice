const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// ================= DATABASE CONNECTION =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });


// ================= EMPLOYEE SCHEMA =================

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    salary: {
      type: Number,
      required: true,
      min: [0, "Salary must be positive"],
    },

    dateOfJoining: {
      type: Date,
      required: true,
    },

    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);


// ================= ROUTES =================


// CREATE Employee
app.post("/employees", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// GET All Employees
app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET Employee by ID
app.get("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// UPDATE Employee
app.put("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// DELETE Employee
app.delete("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// SEARCH Employee by Name or Department
app.get("/employees/search", async (req, res) => {
  try {
    const { name, department } = req.query;

    const query = {};

    if (name) {
      query.fullName = { $regex: name, $options: "i" };
    }

    if (department) {
      query.department = { $regex: department, $options: "i" };
    }

    const employees = await Employee.find(query);

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= SERVER =================

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from 'express';//for creating the server
import fs from 'fs';// file system operations
import csvParser from 'csv-parser';

const app = express();
app.use(express.json());

let employees = [];

// Function to read CSV data and load it into the 'employees' array
const loadCSVData = async () => {
  try {
    const results = [];
    fs.createReadStream('./data/data.csv')
      .pipe(csvParser())
      .on('data', (data) => results.push(data)) //Separate each row , pushing the data into the results array
      .on('end', () => {
        employees = results.map(({ id, name, email, position, salary }) => ({ //Maps the data 
          id: parseInt(id), //converting to numbers
          name,
          email,
          position,
          salary: parseFloat(salary),////converting to numbers
        }));
        console.log('CSV data loaded successfully');
      });
  } catch (error) {
    console.error('Error loading CSV data:', error);
  }
};

loadCSVData(); //load CSV data when the server starts

// API Endpoints
app.get('/employees', (req, res) => res.json(employees)); //Retrieve all employees

app.get('/employees/:id', (req, res) => {//Retrieve a specific employee by ID
  const employee = employees.find(({ id }) => id === parseInt(req.params.id));
  employee ? res.json(employee) : res.status(404).json({ message: 'Employee not found' });
});

app.post('/employees', (req, res) => {//Create new employee
  const { name, email, position, salary } = req.body;
  if (!name || !email || !position || salary <= 0) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  const newEmployee = {
    id: employees.length + 1,
    name,
    email,
    position,
    salary: parseFloat(salary),
  };
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.put('/employees/:id', (req, res) => {//update employee
  const index = employees.findIndex(({ id }) => id === parseInt(req.params.id));
  if (index !== -1) {
    const { name, email, position, salary } = req.body;
    if (!name || !email || !position || salary <= 0) {
      return res.status(400).json({ message: 'Invalid data' });
    }
    employees[index] = { id: parseInt(req.params.id), name, email, position, salary: parseFloat(salary) };
    res.json(employees[index]);
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
});

app.delete('/employees/:id', (req, res) => {//delete employee
  const index = employees.findIndex(({ id }) => id === parseInt(req.params.id));
  if (index !== -1) {
    employees.splice(index, 1);
    res.json({ message: 'Employee deleted successfully' });
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
});

const PORT = 5001; //starts server on 5001
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

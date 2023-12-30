const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 5435;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5435,
});

app.use(express.static('public'));

app.get('/employee', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM employee');
    res.json(result.rows);
    client.release();
  } catch (error) {
    console.error('Error fetching all employees:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/employee/:attribute/:input', async (req, res) => {
  const { attribute, input } = req.params;
  try {
    const client = await pool.connect();

    let functionName;
    let parameter;

    switch (attribute) {
      case 'name':
        functionName = 'search_employee_by_name';
        parameter = input;
        break;
      case 'position':
        functionName = 'search_employee_by_position';
        parameter = input;
        break;
case 'position':
  functionName = 'search_employee_by_position';
  parameter = input;
  break;
case 'contact_num':
  functionName = 'search_employee_by_phone';
  parameter = parseInt(input);
  break;


      case 'email':
        functionName = 'search_employee_by_email';
        parameter = input;
        break;
      case 'contact_num':
        functionName = 'search_employee_by_phone';
        parameter = parseInt(input);
        break;
      case 'dept':
        functionName = 'search_employee_by_department';
        parameter = input;
        break;
      default:
        res.status(400).send('Invalid attribute');
        return;
    }

    console.log('Attribute:', attribute);
    console.log('Input:', input);
    console.log('Function:', functionName);

    const result = await client.query(`SELECT * FROM ${functionName}($1)`, [parameter]);

    res.json(result.rows);
    client.release();
  } catch (error) {
    console.error(`Error searching employees by ${attribute}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
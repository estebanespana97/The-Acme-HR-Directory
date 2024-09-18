const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_categories_db')
const app = express();
app.use(express.json())
app.use(require('morgan')('dev'))

//POST
app.post('/api/employees', async (req, res, next) => {
    try{
        const { name, department_id } = req.body;
        console.log(name);
        console.log(department_id);
        const response = await client.query("INSERT INTO employees (name,department_id ) VALUES ($1, $2)", [name, department_id]);
        res.json(`succesfully added name and department_id: ${name} ${department_id}`);
    }
    catch(ex){
        next(ex)
    }
});

//GETemployees
app.get('/api/employees', async (req, res, next) => {
    try{
        const SQL = `SELECT * from employees ORDER BY created_at DESC;`;
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch(ex){
        next(ex);
    }
});

//GETdepartments
app.get('/api/departments', async (req, res, next) => {
    try{
        const SQL = `SELECT * from departments;`;
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch(ex){
        next(ex);
    }
});

//PUT NOTES ID
app.put('/api/employees/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const {name} = req.body;
        const response = await client.query("UPDATE employees SET name=$1,updated_at=now() WHERE id = $2 RETURNING *", [name, id]);
        res.json(`succesfully employees updated Id: ${id} with this name: ${name}`);
        //res.send(response.rows[0])
    }
    catch(ex){
        next(ex)
    }
});

//DELETE
app.delete('/api/employees/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const response = await client.query("DELETE FROM employees WHERE id = $1", [id]);
        res.json(`succesfully deleted employees: ${id}`);
    }
    catch(ex){
        next(ex)
    }
});

const init = async () => {
    await client.connect()
    console.log('connected to database');
    let SQL = `DROP TABLE IF EXISTS employees;
            DROP TABLE IF EXISTS departments;
            CREATE TABLE departments(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100)
            );
            CREATE TABLE employees(
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            name VARCHAR(100),
            department_id INTEGER REFERENCES departments(id) NOT NULL
            );` 
    await client.query(SQL)
    console.log('tables creatd')
    SQL = `INSERT INTO departments(name) VALUES('IT');
            INSERT INTO departments(name) VALUES('BizDev');
            INSERT INTO employees(name, department_id) VALUES('Esteban', (SELECT id FROM departments WHERE name='IT'));
            INSERT INTO employees(name, department_id) VALUES('Kristin', (SELECT id FROM departments WHERE name='BizDev'));
            INSERT INTO employees(name, department_id) VALUES('Joelle', (SELECT id FROM departments WHERE name='BizDev'));`
    await client.query(SQL)
    console.log('data seed')
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
};

init()
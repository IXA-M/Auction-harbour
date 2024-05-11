const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql");
const bcrypt =require("bcrypt")
dotenv.config();

app.use(cors());
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

app.use(express.json());

// Database connection
const db = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
   })
   

db.getConnection( (err, connection)=> { if (err) throw (err)
    console.log ("DB connected successful: " + connection.threadId)})
   
    const port = process.env.PORT
    app.listen(port, 
    ()=> console.log(`Server Started on port ${port}...`))



//register
    app.post("/register", async (req, res) => {
        try {
            const name = req.body.username;
            const password = req.body.password;
    
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Check if the user already exists
            const searchQuery = "SELECT * FROM logindetails WHERE username = ?";
            db.query(searchQuery, [name], async (searchErr, searchResult) => {
                if (searchErr) {
                    throw searchErr;
                }
    
                if (searchResult.length !== 0) {
                    console.log("User already exists");
                    return res.status(409).send("User already exists");
                }
    
                // If user doesn't exist, insert new user
                const insertQuery = "INSERT INTO logindetails (username, password) VALUES (?, ?)";
                db.query(insertQuery, [name, hashedPassword], (insertErr, insertResult) => {
                    if (insertErr) {
                        throw insertErr;
                    }
                    res.status(201).send("New user created");
                });
            });
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).send("Error creating user");
        }
    });
    
       //login

       app.post("/login", (req, res) => {
        const user = req.body.username
        const password = req.body.password
        db.getConnection(async (err, connection) => {
        if (err) throw (err)
        const sqlSearch = "Select * from logindetails where username = ?"
        await connection.query(sqlSearch, [user], async (err, result) => {
            connection.release()
 if (err) throw (err)
 if (result.length === 0) {
 res.sendStatus(404).send("User does not exist");
 } else {
 const hashedPassword = result[0].password
 //get the hashedPassword from result
 if (await bcrypt.compare(password, hashedPassword)) {
 res.send(`${user} is logged in!`)
 } else {
 res.send("Password or Username incorrect!")
 }
 }
 })
 })
})



// Start the server


       
    
           

       
//create
// app.post('/insert',(request,response)=>{

// })

// //read

// app.get('/getAll',(request,response)=>{
// console.log('test');
// })

// //update



// // delete


// app.listen(process.env.PORT,() => console.log('app is running'))
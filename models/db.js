const mysql = require('mysql2'); //recupere my sql2
const dotenv = require('dotenv'); //recupere dotenv
dotenv.config(); 
const connection = mysql.createConnection({ 
    host: process.env.DB_HOST,      //recupere db host,user,nom,mdp  dans le .env
    user: process.env.DB_USER, 
    password: process.env.DB_PASS,    //pour la connection
    database: process.env.DB_NAME 
}); 
    connection.connect(err => { 
        if (err) throw err; 
        console.log('Connecté à MySQL !'); 
    });
module.exports = connection;
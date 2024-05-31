const mysql = require('mysql')

// Set up database connection
const dbConnection = mysql.createConnection({
  host: 'localhost', // e.g. 'localhost'
  user: 'root',
  password: '',
  database: 'Censo'
})

// Connect to the database
dbConnection.connect(err => {
  if (err) {
    console.error('Error connecting: ' + err.stack)
    return
  }
  console.log('Connected as id ' + dbConnection.threadId)
})

module.exports = dbConnection

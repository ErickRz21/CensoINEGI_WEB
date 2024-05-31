const dbConnection = require('./conexion')

// Function to check if user is authenticated
function checkAuthenticated (req, res, next) {
  if (req.session.loggedIn) {
    return next()
  }
  res.redirect('/')
}

// Function to get a record by ID from Censo Habitantes table
const getHabitanteById = (id, callback) => {
  const query = 'SELECT * FROM `Habitantes` WHERE ID_Habitante = ?'
  dbConnection.query(query, [id], (error, results) => {
    if (error) throw error
    callback(results[0])
  })
}

// Function to update a record by ID in Censo Habitantes table
const updateHabitanteById = (id, data, callback) => {
  const query = 'UPDATE `Habitantes` SET ? WHERE ID_Habitante = ?'
  dbConnection.query(query, [data, id], (error, results) => {
    if (error) {
      console.error('Error in updateHabitanteById:', error)
      callback(error, null)
    } else {
      console.log('Update successful:', results)
      callback(null, results)
    }
  })
}

// Function to delete a record by ID from Censo Habitantes table
const deleteHabitanteById = (id, callback) => {
  const query = 'DELETE FROM `Habitantes` WHERE ID_Habitante = ?'
  dbConnection.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error in deleteHabitanteById:', error)
      callback(error)
    } else {
      console.log('Delete successful:', results)
      callback(null)
    }
  })
}

// Assuming Viviendas table has an ID column named ID_Vivienda
// Function to get a record by ID from Viviendas table
const getViviendaById = (id, callback) => {
  const query = 'SELECT * FROM `Registros` WHERE ID_Viviendas = ?'
  dbConnection.query(query, [id], (error, results) => {
    if (error) throw error
    callback(results[0])
  })
}

// Function to update a record by ID in Viviendas table
const updateViviendaById = (id, data, callback) => {
  const query = 'UPDATE `Registros` SET ? WHERE ID_Viviendas = ?'
  dbConnection.query(query, [data, id], (error, results) => {
    if (error) {
      console.error('Error in updateViviendaById:', error)
      callback(error, null)
    } else {
      console.log('Update successful:', results)
      callback(null, results)
    }
  })
}

// Function to delete a record by ID from Viviendas table
const deleteViviendaById = (id, callback) => {
  const query = 'DELETE FROM `Registros` WHERE ID_Viviendas = ?'
  dbConnection.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error in deleteViviendaById:', error)
      callback(error)
    } else {
      console.log('Delete successful:', results)
      callback(null)
    }
  })
}

function closeDatabaseConnection () {
  dbConnection.end(err => {
    if (err) {
      console.error('Error closing the database connection:', err)
    } else {
      console.log('Database connection closed.')
    }
  })
}

module.exports = {
  checkAuthenticated,
  getHabitanteById,
  updateHabitanteById,
  deleteHabitanteById,
  getViviendaById,
  updateViviendaById,
  deleteViviendaById,
  closeDatabaseConnection
}

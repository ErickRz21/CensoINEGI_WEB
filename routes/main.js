const express = require('express')
const dbConnection = require('../models/conexion')
const router = express.Router()
const { checkAuthenticated } = require('../models/script')

router.get('/', function (req, res) {
  res.render('login')
})

router.get('/menu', checkAuthenticated, function (req, res) {
  res.render('menu')
})

router.get('/habitantes', checkAuthenticated, function (req, res) {
  res.render('registrarHabitantes')
})

router.get('/viviendas', checkAuthenticated, function (req, res) {
  res.render('registrarViviendas')
})

router.get('/dashboard', checkAuthenticated, (req, res) => {
  const sqlQuery1 = 'SELECT * FROM Registros'
  const sqlQuery2 = 'SELECT * FROM Habitantes'
  const sqlQuery3 = 'SELECT * FROM Municipio'

  dbConnection.query(sqlQuery1, (error1, results1, fields1) => {
    if (error1) {
      res.status(500).send('Error retrieving data from Registros')
    } else {
      // Execute the second query inside the callback of the first query
      dbConnection.query(sqlQuery2, (error2, results2, fields2) => {
        if (error2) {
          res.status(500).send('Error retrieving data from Habitantes')
        } else {
          dbConnection.query(sqlQuery3, (error3, results3, fields3) => {
            if (error3) {
              res.status(500).send('Error retrieving data from Municipio')
            } else {
              // Pass both results to the EJS template
              res.render('dashboard', {
                records: results1,
                anotherRecords: results2,
                munRecords: results3
              })
            }
          })
        }
      })
    }
  })
})

router.get('/data/cantVivienda', (req, res) => {
  const sqlQuery =
    'SELECT TipoVivienda, SUM(CantidadPersonas) AS TotalPersonas FROM Registros GROUP BY TipoVivienda'

  dbConnection.query(sqlQuery, (error, results, fields) => {
    if (error) throw error
    // Send data as JSON
    res.json(results)
  })
})

// API endpoint to get the latest data for municipalities
router.get('/data/cantMunicipio', (req, res) => {
  const sqlQuery =
    'SELECT Municipio, SUM(CantidadPersonas) AS PersonasMun FROM Registros GROUP BY Municipio'

  dbConnection.query(sqlQuery, (error, results, fields) => {
    if (error) throw error
    // Send data as JSON
    res.json(results)
  })
})

router.get('/logout', (req, res) => {
  if (req.session) {
    // Destroy the session and handle any errors
    req.session.destroy(err => {
      if (err) {
        // Handle error
        console.error('Session destruction error', err)
        res.status(500).send('Error while logging out')
      } else {
        res.redirect('/') // Redirect to the login page or home page
      }
    })
  } else {
    res.redirect('/') // Redirect if no session exists
  }
})

module.exports = router

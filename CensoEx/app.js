const express = require('express')
const app = express()
const path = require('path')
const dbConnection = require('./models/conexion')
const session = require('express-session')
const bodyParser = require('body-parser')
const {
  checkAuthenticated,
  getHabitanteById,
  updateHabitanteById,
  deleteHabitanteById,
  getViviendaById,
  updateViviendaById,
  deleteViviendaById,
  closeDatabaseConnection
} = require('./models/script')

app.use(express.static('public'))

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'static')))

// Set view engine to EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.urlencoded({ extended: true }))

// Import route
const mainRoute = require('./routes/main')

// Use routes
app.use('/', mainRoute)

// Login Authentication
// Handle login form submission

app.post('/', (req, res) => {
  const { username, password } = req.body
  const sql = 'SELECT * FROM Admin WHERE Username = ?'

  dbConnection.query(sql, [username], (err, results) => {
    if (err) {
      // Handle the error appropriately in your application
      res.status(500).send('Server error occurred.')
      return console.error(err.message)
    }
    if (results.length && results[0].Password === password) {
      req.session.loggedIn = true
      // Redirect to menu or another appropriate page after successful login
      res.redirect('/menu')
    } else {
      // You might want to redirect back to the login page or show an error message
      res.redirect('/')
    }
  })
})

// Register viviendas
app.post('/viviendas', (req, res) => {
  let data = {
    ID_Vivienda: req.body.ID_Vivienda,
    AtributosVivienda: req.body.AtributosVivienda,
    CantidadPersonas: req.body.CantidadPersonas,
    TipoVivienda: req.body.TipoVivienda,
    Dedicacion: req.body.Dedicacion,
    Municipio: req.body.Municipio,
    Direccion: req.body.Direccion
  }
  let sql =
    'INSERT INTO `Registros` SET `AtributosVivienda` = ?, `CantidadPersonas` = ?, `TipoVivienda` = ?, `Dedicacion` = ?, `Municipio` = ?, `Direccion` = ?'
  dbConnection.query(
    sql,
    [
      data.AtributosVivienda,
      data.CantidadPersonas,
      data.TipoVivienda,
      data.Dedicacion,
      data.Municipio,
      data.Direccion
    ],
    (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).send('Error while inserting data into the database')
      } else {
        // res.redirect('/viviendas')
      }
    }
  )
})

// Register Habitantes
app.post('/habitantes', (req, res) => {
  let data = {
    ID_Habitante: req.body.ID_Habitante,
    Nombre: req.body.Nombre,
    Edad: req.body.Edad,
    Genero: req.body.Genero
  }
  let sql =
    'INSERT INTO `Habitantes` SET `Nombre` = ?, `Edad` = ?, `Genero` = ?'
  dbConnection.query(
    sql,
    [data.Nombre, data.Edad, data.Genero],
    (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).send('Error while inserting data into the database')
      } else {
        // res.redirect('/habitantes')
      }
    }
  )
})

// Editar Viviendas
app.get('/viviendas/edit/:id', checkAuthenticated, (req, res) => {
  const id = req.params.id
  getViviendaById(id, record => {
    res.render('edit_vivienda', { record: record })
  })
})

app.post('/viviendas/update/:id', (req, res) => {
  const id = req.params.id
  const updatedData = {
    AtributosVivienda: req.body.AtributosVivienda,
    CantidadPersonas: req.body.CantidadPersonas,
    TipoVivienda: req.body.TipoVivienda,
    Dedicacion: req.body.Dedicacion,
    Municipio: req.body.Municipio,
    Direccion: req.body.Direccion
    // ... other fields
  }

  updateViviendaById(id, updatedData, (error, result) => {
    // The callback function needs to be defined here
    if (error) {
      // handle error
      res.status(500).send('Database error during update')
    } else {
      // Redirect or handle the successful update
      res.redirect('/dashboard')
    }
  })
})

// Eliminar viviendas
app.get('/viviendas/delete/:id', checkAuthenticated, (req, res) => {
  const id = req.params.id
  deleteViviendaById(id, error => {
    if (error) {
      // Handle the error, maybe send a failure response
      res.status(500).send('Error deleting the record.')
    } else {
      // On successful deletion, redirect or send a success response
      res.redirect('/dashboard')
    }
  })
})

// Editar Habitantes
app.get('/habitantes/edit/:id', checkAuthenticated, (req, res) => {
  const id = req.params.id
  getHabitanteById(id, record => {
    if (record) {
      res.render('edit_habitante', { record: record })
    } else {
      res.status(404).send('Habitante not found')
    }
  })
})

app.post('/habitantes/update/:id', (req, res) => {
  const id = req.params.id
  const updatedData = {
    Nombre: req.body.Nombre,
    Edad: req.body.Edad,
    Genero: req.body.Genero
    // ... other fields should match the column names in Habitantes table
  }

  updateHabitanteById(id, updatedData, (error, result) => {
    if (error) {
      // handle error
      res.status(500).send('Database error during update')
    } else {
      // Redirect or handle the successful update
      res.redirect('/dashboard') // Redirect to the Habitantes dashboard
    }
  })
})

app.get('/habitantes/delete/:id', checkAuthenticated, (req, res) => {
  const id = req.params.id
  deleteHabitanteById(id, error => {
    if (error) {
      // Handle the error, maybe send a failure response
      res.status(500).send('Error deleting the habitante.')
    } else {
      // On successful deletion, redirect or send a success response
      res.redirect('/dashboard') // Redirect to the Habitantes dashboard
    }
  })
})

// Close the database connection on process termination
process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    closeDatabaseConnection()
  })
})

process.on('SIGTERM', () => {
  console.log('\nSIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    closeDatabaseConnection()
  })
})

// Start server
const server = app.listen(3000, function () {
  console.log('Server started on port 3000')
})

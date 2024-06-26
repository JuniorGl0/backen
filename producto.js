const fs = require('fs');

class ProductManager {
  // Variable this.path iniciada desde el constructor, recibe la ruta a trabajar
  constructor(path) {
    this.path = path;
  }
  

  // Recibe un objeto "product" que representa el nuevo producto que se quiere agregar.
  async addProduct(title, description, price, thumbnail, code, stock) {
    const products = await this.readProducts();
    const newProduct = {
      id: this.getNextId(products),
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    // Agrega el nuevo producto al array de productos y guarda la actualización en el archivo
    products.push(newProduct);
    await this.saveProducts(products);

    // Devuelve el nuevo producto creado
    return newProduct;
  }

  // Toma un array de productos y lo guarda en el archivo especificado por this.path.
  async saveProducts(products) {
    // Guarda el array de productos en el archivo en formato JSON
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
  }

  // Calcula el próximo id que se asignará a un nuevo producto.
  getNextId(products) {
    const maxId = products.reduce((max, product) => (product.id > max ? product.id : max), 0);
    return maxId + 1;
  }

  // Lee el archivo de productos y devuelve todos los productos en formato de arreglo
  async getProducts() {
    return await this.readProducts();
  }

  async readProducts() {
    try {
      // Intenta leer el archivo y parsear su contenido como JSON
      const data = await fs.promises.readFile(this.path, 'utf-8');
      // Devuelve el array de productos o un array vacío si el archivo está vacío o hay algún error
      return JSON.parse(data) || [];
    } catch (error) {
      // Si el archivo no existe o hay algún error al leerlo, devuelve un array vacío
      return [];
    }
  }

  // Recibe un id y, tras leer el archivo, busca el producto con el id específico y lo devuelve en formato objeto
  async getProductById(id) {
    const products = await this.readProducts();
    return products.find(product => product.id === id);
  }

  // Método updateProduct, recibe id y el campo a actualizar y actualiza el producto que tenga ese id en el archivo.
  async updateProduct(id, updatedFields) {
    const products = await this.readProducts();
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      await this.saveProducts(products);
      return products[index];
    }
    return null;
  }

  // Método deleteProduct, recibe un id y elimina el producto que tenga ese id en el archivo
  async deleteProduct(id) {
    const products = await this.readProducts();
    const filteredProducts = products.filter(product => product.id !== id);
    await this.saveProducts(filteredProducts);
    return filteredProducts;
  }
}

module.exports = ProductManager;




const express = require('express')
const session = require('express-session')
const mongoStore = require('connect-mongo')
const cors = require('cors')
const { connectDb } = require('./config/config.js')
const passport = require('passport')
const { initializePassport } = require('./passport-jwt/passport.config.js')
const appRouter = require('./routes/general.router.js')
const cookie = require('cookie-parser')
const configureSocketIO = require('./helpers/socketIO.js')
const handlebars = require('express-handlebars')
const handlebarsHelpers = require('handlebars-helpers')()
const eq = handlebarsHelpers.eq 

const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname+'/public'))
app.use(cookie())
app.use(cors())
app.use(session({
  store: mongoStore.create({
    mongoUrl: process.env.MONGO_URI, 
    mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    ttl: 15000000000,
  }),
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(appRouter)

/* app.use(session({
  secret: 'secret'
})) */

initializePassport()
app.use(passport.initialize())
//app.use(passport.session())

/* The code `app.engine('handlebars', handlebars.engine())` sets the template engine for the
application to Handlebars. It tells Express to use Handlebars as the view engine. */
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: {
    eq: eq
  }
}))
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

//connection to data base
connectDb()

const serverHttp = app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

const io = configureSocketIO(serverHttp)

module.exports = { app, io }
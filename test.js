const ProductManager = require('./productManager'); 
async function runTests() {
  let productManager;

  try {
    // Test 1: Se creará una instancia de la clase ProductManager
    productManager = new ProductManager('productos_test.json');

    // Test 2: Se llamará a "getProducts" recién creada la instancia, debe devolver un arreglo vacío
    const productsInitial = await productManager.getProducts();
    console.log('Test 2:', productsInitial);

    // Test 3: Se llamará al método "addProduct" con campos específicos
    const newProduct = {
      title: 'producto prueba',
      description: 'Este es un producto prueba',
      price: 200,
      thumbnail: 'Sin imagen',
      code: 'abc123',
      stock: 25,
    };
    const addedProduct = await productManager.addProduct(newProduct);
    console.log('Test 3:', addedProduct);

    // Test 4: Se llama a "getProducts" nuevamente, esta vez debe aparecer el producto recién agregado
    const productsAfterAdd = await productManager.getProducts();
    console.log('Test 4:', productsAfterAdd);

    // Test 5: Se llama a "getProductById" y se verifica que devuelva el producto con el id especificado
    const retrievedProduct = await productManager.getProductById(addedProduct.id);
    console.log('Test 5:', retrievedProduct);

    // Test 6: Se llama a "updateProduct" y se verifica que no se elimine el id y se haya hecho la actualización
    const updatedProduct = await productManager.updateProduct(addedProduct.id, { price: 250 });
    console.log('Test 6:', updatedProduct);

    // Test 7: Se llama a "deleteProduct" y se verifica que realmente se elimine el producto
    const productsAfterDelete = await productManager.deleteProduct(addedProduct.id);
    console.log('Test 7:', productsAfterDelete);
  } catch (error) {
    console.error('Error en las pruebas:', error.message);
  }
}

// Ejecuta las pruebas
runTests();      

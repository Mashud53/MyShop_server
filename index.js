const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const morgan = require('morgan')
const port = process.env.PORT || 5000;


// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://myshop-195e1.web.app'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

const verifyToken = async (req, res, next) => {
  const token = req.cookie?.token
  console.log(token)
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b2fkq1f.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("myShop").collection("products");
    const usersCollection = client.db("myShop").collection("users");
    const ordersCollection = client.db("myShop").collection("orders");
    const cartsCollection = client.db("myShop").collection("carts");

    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
        .send({ success: true })
    })

    // logout
    app.get('/logout', async (req, res) => {
      try {
        res.clearCookie('token', {
          maxAge: 0,
          secure: process.env.NODE_ENV === 'producton',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
          .send({ success: true })
        console.log('logout successful')
      } catch (err) {
        res.status(500).send(err)
      }
    })

    // save or modify user email, status in DB
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email }
      const options = { upsert: true }
      const isExist = await usersCollection.findOne(query)
      console.log('user found?......>', isExist)
      if (isExist) return res.send(isExist)
      const result = await usersCollection.updateOne(query, {
        $set: { ...user, timestamp: Date.now() },
      },
        options
      )
      res.send(result)
    })

    // get user role
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await usersCollection.findOne(query)
      res.send(result)
    })
    // get all user 
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    // Change user role 
    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id;
      const role = req.body.role;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: role
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query);
      res.send(result)
    })

    // Product
    app.get('/product', async (req, res) => {
      const result = await productsCollection.find().toArray();

      res.send(result);
    })
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query)
      res.send(result)
    })
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;      
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query)
      res.send(result)
    })
    // Product update---------------------- 
    app.patch('/product/:id', async (req, res) => {
      const id = req.params.id;
      const productData = req.body;
      const query = { _id: new ObjectId(id) }
      const filter = await productsCollection.findOne(query)
      const previouseDiscount =[filter.currentPrice1, filter.currentPrice2, filter.currentPrice3]
      const updateDiscount = [productData.currentPrice1, productData.currentPrice2, productData.currentPrice3]
      
      if(previouseDiscount && updateDiscount){
        const updateDoc = {
            $set: {
              name: productData.name,
              brand: productData.brand,
              category: productData.category,
              type: productData.type,
              price1: productData.price1,
              price2: productData.price2,
              currentPrice1: productData.currentPrice1,
              currentPrice2: productData.currentPrice2,
              currentPrice3: productData.currentPrice3,
              price3: productData.price3,
              storage1: productData.storage1,
              storage2: productData.storage2,
              storage3: productData.storage3,
              color1: productData.color1,
              color2: productData.color2,
              color3: productData.color3,
              color4: productData.color4,
              color5: productData.color5,
              color6: productData.color6,
              operatingSystem: productData.operatingSystem,
              network: productData.network,
              wirelessNetwork: productData.wirelessNetwork,
              screen: productData.screen,
              screenSize: productData.screenSize,
              connector: productData.connector,
              desc: productData.desc,
              desc1: productData.desc1,
              desc2: productData.desc2,
              desc3: productData.desc3,
              desc4: productData.desc4,
              desc5: productData.desc5,
              productType: productData.productType,
              imageURL1: productData.imageURL1,
              imageURL2: productData.imageURL2,
              imageURL3: productData.imageURL3,
              imageURL4: productData.imageURL4,
              imageURL5: productData.imageURL5
            }
          }
          const result = await productsCollection.updateOne(query, updateDoc)
          res.send(result)

      }else if(!previouseDiscount && updateDiscount){
        const updateDoc = {
            $set: {
              name: productData.name,
              brand: productData.brand,
              category: productData.category,
              type: productData.type,
              price1: productData.price1,
              price2: productData.price2,
              currentPrice1: productData.currentPrice1,
              currentPrice2: productData.currentPrice2,
              currentPrice3: productData.currentPrice3,
              price3: productData.price3,
              storage1: productData.storage1,
              storage2: productData.storage2,
              storage3: productData.storage3,
              color1: productData.color1,
              color2: productData.color2,
              color3: productData.color3,
              color4: productData.color4,
              color5: productData.color5,
              color6: productData.color6,
              operatingSystem: productData.operatingSystem,
              network: productData.network,
              wirelessNetwork: productData.wirelessNetwork,
              screen: productData.screen,
              screenSize: productData.screenSize,
              connector: productData.connector,
              desc: productData.desc,
              desc1: productData.desc1,
              desc2: productData.desc2,
              desc3: productData.desc3,
              desc4: productData.desc4,
              desc5: productData.desc5,
              productType: productData.productType,
              imageURL1: productData.imageURL1,
              imageURL2: productData.imageURL2,
              imageURL3: productData.imageURL3,
              imageURL4: productData.imageURL4,
              imageURL5: productData.imageURL5
            }
          }
          const options = { upsert: true }
          const result = await productsCollection.updateOne(query, updateDoc, options)
          res.send(result)
      }else   {
        const updateDoc = {
          $set: {
            name: productData.name,
            brand: productData.brand,
            category: productData.category,
            type: productData.type,
            price1: productData.price1,
            price2: productData.price2,
            currentPrice1: productData.currentPrice1,
            currentPrice2: productData.currentPrice2,
            currentPrice3: productData.currentPrice3,
            price3: productData.price3,
            storage1: productData.storage1,
            storage2: productData.storage2,
            storage3: productData.storage3,
            color1: productData.color1,
            color2: productData.color2,
            color3: productData.color3,
            color4: productData.color4,
            color5: productData.color5,
            color6: productData.color6,
            operatingSystem: productData.operatingSystem,
            network: productData.network,
            wirelessNetwork: productData.wirelessNetwork,
            screen: productData.screen,
            screenSize: productData.screenSize,
            connector: productData.connector,
            desc: productData.desc,
            desc1: productData.desc1,
            desc2: productData.desc2,
            desc3: productData.desc3,
            desc4: productData.desc4,
            desc5: productData.desc5,
            productType: productData.productType,
            imageURL1: productData.imageURL1,
            imageURL2: productData.imageURL2,
            imageURL3: productData.imageURL3,
            imageURL4: productData.imageURL4,
            imageURL5: productData.imageURL5
          }
        }
        const result = await productsCollection.updateOne(query, updateDoc)
        res.send(result)
      }  
      
      
    })

    // popular product 
    app.get('/popularProduct', async(req, res)=>{
      const result = await productsCollection.find().sort({ 'views': -1 }).toArray()
      res.send(result)
    })

    // featured product
    app.get('/featuredProduct', async(req, res)=>{
      const query = {product: 'featured'}
      const result = await productsCollection.find(query).toArray()
      res.send(result)
    })
    // trands product
    app.get('/trand', async(req, res)=>{
      const result = await productsCollection.find().sort({ 'totalSales': -1 }).toArray()
      res.send(result)
    })
    // discountProducts product
    app.get('/discountProduct', async(req, res)=>{      
      const result = await productsCollection.find({currentPrice1:{$gt:0} }).toArray()
      res.send(result)
    })

    // product views update --------------------------------
    app.patch('/updateViews/:id', async (req, res) => {
      const id = req.params.id;
      const currentView = req.body;
      const query = { _id: new ObjectId(id) }
      const filter = await productsCollection.findOne(query)
      console.log(filter.price1)
      if (filter.views) {
        const updateDoc = {
          $set: {
            views: parseFloat(filter.views) + currentView.views
          }
        }
        
        const result = await productsCollection.updateOne(query, updateDoc)
        res.send(result)
      } else {
        const updateDoc = {
          $set: {
            views: currentView.views
          }
        }
        const options = { upsert: true }
        const result = await productsCollection.updateOne(query, updateDoc, options)
        res.send(result)
      }
      
    })

    // Total Sales update .....................
    app.patch('/updateSales/:id', async (req, res) => {
      const id = req.params.id;
      const currentSales = req.body;
      const query = { _id: new ObjectId(id) }
      const filter = await productsCollection.findOne(query)
      console.log('update sales =====',currentSales)
      if (filter.totalSales) {
        const updateDoc = {
          $set: {
            totalSales: parseFloat(filter.totalSales) + currentSales.sales
          }
        }
        
        const result = await productsCollection.updateOne(query, updateDoc)
        res.send(result)
      } else {
        const updateDoc = {
          $set: {
           totalSales : currentSales.sales
          }
        }
        const options = { upsert: true }
        const result = await productsCollection.updateOne(query, updateDoc, options)
        res.send(result)
      }
      
    })

    app.get('/products/:name', async (req, res) => {
      const name = req.params.name;

      console.log("name is ======", name)
      const query = { brand: name }
      const result = await productsCollection.find(query).toArray();
      // console.log("Apple pRODUCT ====",result)
      res.send(result)
    })
    app.post('/product', async (req, res) => {
      const product = req.body
      const result = await productsCollection.insertOne(product);
      res.send(result)
    })

    /**
     * --------------
     * carts collection
     * --------------
     */
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      console.log("email====>", email)
      const filter = { userEmail: email };
      result = await cartsCollection.find(filter).toArray()
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const cartItems = req.body;
      console.log(cartItems)
      const result = await cartsCollection.insertOne(cartItems);
      res.send(result);

    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await cartsCollection.deleteOne(query)
      res.send(result)
    })

    // ---------------------
    // ordr collection 
    // ----------------------
    // save order in order collection 
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      // send email ......

      res.send(result)
    })
    app.get('/orders', async (req, res) => {

      const result = await ordersCollection.find().toArray();
      // send email ......

      res.send(result)
    })

    app.patch('/order/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          status: status
        }
      }
      const result = await ordersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Shop is Open')
})
app.listen(port, () => {
  console.log(`My shop is open on: ${port}`)
})


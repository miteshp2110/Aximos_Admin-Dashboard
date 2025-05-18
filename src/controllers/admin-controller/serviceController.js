const { pool } = require("../../config/db");

function groupByService(data) {
  const serviceMap = {};
  
  // First pass: Create all services with their categories
  data.forEach(entry => {
    const {
      status,
      id,
      name,
      description,
      largeImage,
      smallImage,
      category,
      categoryId
    } = entry;

    // Create service if it doesn't exist
    if (!serviceMap[id]) {
      serviceMap[id] = {
        isActive: status === 1 ? true : false,
        id,
        name,
        description,
        largeImage,
        smallImage,
        categories: []
      };
    }
    
    // Add category if it doesn't exist
    const serviceBucket = serviceMap[id];
    if (!serviceBucket.categories.some(cat => cat.id === categoryId)) {
      serviceBucket.categories.push({
        name: category,
        id: categoryId,
        items: []
      });
    }
  });
  
  // Second pass: Add items to their respective categories
  data.forEach(entry => {
    const {
      id,
      categoryId,
      productId,
      product,
      price,
      productUrl
    } = entry;
    
    // Skip entries that don't have product data
    if (!productId) return;
    
    const serviceBucket = serviceMap[id];
    const catBucket = serviceBucket.categories.find(cat => cat.id === categoryId);
    
    catBucket.items.push({ 
      id: productId,
      name: product, 
      price: parseFloat(price),
      image: productUrl 
    });
  });

  // Return the array of services
  return Object.values(serviceMap);
}

// Modified query to fetch all categories, even those without items
const getAllServices = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        // Modified query that gets all categories, regardless of items
        const [result] = await connection.query(`
            SELECT 
                s.status as status, 
                s.id AS id, 
                s.name AS name, 
                s.description as description, 
                s.iconUrlBig AS largeImage, 
                s.iconUrlSmall AS smallImage, 
                c.name AS category, 
                c.id as categoryId, 
                i.id AS productId, 
                i.name AS product, 
                i.price AS price, 
                i.iconUrl AS productUrl 
            FROM 
                services AS s
            LEFT JOIN 
                category AS c ON c.service_id = s.id
            LEFT JOIN 
                items AS i ON i.category_id = c.id
        `);
        
        connection.release();
        res.json({ success: true, data: groupByService(result) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Add new service
const addService = async (req, res) => {
    const { name, description,status = true} = req.body;
    const iconUrlBig = req.largeImage
    const iconUrlSmall = req.smallImage
    if(!name || !description || !iconUrlBig || !iconUrlSmall) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        
        await pool.query(
            "INSERT INTO services (name, description, iconUrlBig, iconUrlSmall,status) VALUES (?, ?, ?, ?, ?)",
            [name, description, iconUrlBig, iconUrlSmall,status?1:0]
        );

        res.json({ success: true, message: "Service added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const addNewCategory = async (req, res) => {
    const { name, service_id } = req.body;
    if(!name || !service_id) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const connection = await pool.getConnection();
        await connection.query(
            "INSERT INTO category (name, service_id) VALUES (?, ?)",
            [name, service_id]
        );
        connection.release();

        res.json({ success: true, message: "Category added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await pool.query('select count(id) from items where category_id = ?', [id]);
      if (result[0]['count(id)'] > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete category with items" });
      }
        
        await pool.query(
            "DELETE FROM category WHERE id = ?",
            [id]
        );
       

        res.json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        await pool.query(
            "UPDATE category SET name = ? WHERE id = ?",
            [name, id]
        );

        res.json({ success: true, message: "Category updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const addItem = async (req, res) => {

    const iconUrl  = req.imageName
    const { name, price, category_id } = req.body;
    if(!name || !price || !category_id || !iconUrl) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await pool.query(
            "INSERT INTO items (name, price, iconUrl, category_id) VALUES (?, ?, ?, ?)",
            [name, price, iconUrl, category_id]
        );

        res.json({ success: true, message: "Item added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteItem = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the item exists
        const [result] = await pool.query("select count(id) from order_items where item_id = ?", [id]);
        if (result[0]['count(id)'] > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete item that is part of an order" });
        }
        await pool.query(
            "DELETE FROM items WHERE id = ?",
            [id]
        );

        res.json({ success: true, message: "Item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateItem = async(req,res) =>{
    const { id } = req.params;
    const { name, price } = req.body;
    const iconUrl  = req.imageName

    try {
        if(!name || !price){
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if(iconUrl){
            await pool.query(
                "UPDATE items SET name = ?, price = ?, iconUrl = ? WHERE id = ?",
                [name, price, iconUrl, id]
            );
        }
        else{
            await pool.query(
                "UPDATE items SET name = ?, price = ? WHERE id = ?",
                [name, price, id]
            )
        }

        res.json({ success: true, message: "Item updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('select count(id) from category where service_id = ?', [id]);
        if (result[0]['count(id)'] > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete service with categories" });
        }
        await pool.query(
            "DELETE FROM services WHERE id = ?",
            [id]
        );

        res.json({ success: true, message: "Service deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateServiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await pool.query(
            "UPDATE services SET status = ? WHERE id = ?",
            [status, id]
        );

        res.json({ success: true, message: "Service status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const iconUrlBig = req.largeImage
    const iconUrlSmall = req.smallImage


    try {
        if(!name || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        await pool.query(
            "UPDATE services SET name = ?, description = ?,status = ? WHERE id = ?",
            [name, description, status?1:0, id]
        );

        if(iconUrlBig){
            await pool.query(
                "UPDATE services SET iconUrlBig = ? WHERE id = ?",
                [iconUrlBig, id]
            );
        }
        if(iconUrlSmall){
            await pool.query(
                "UPDATE services SET iconUrlSmall = ? WHERE id = ?",
                [iconUrlSmall, id]
            );
        }

        res.json({ success: true, message: "Service updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
module.exports = {
    getAllServices,
    addService,
    addNewCategory,
    deleteCategory,
    updateCategory,
    addItem,
    deleteItem,
    updateItem,
    deleteService,
    updateServiceStatus,
    updateService
};
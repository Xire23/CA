const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
    }
});
const upload = multer({ storage: storage });

// MySQL connection
const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_Hao Min',
    password: 'M8*e8TANbsZ23Mr',
    database: 'freedb_EcoSwap'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected successfully to MySQL database');
});

// Setup session management
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to make user available in all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Home page
app.get('/', (req, res) => {
    res.render('index.ejs', { user: req.session.user });
});

// Browse items page
app.get('/items', (req, res) => {
    const query = `
        SELECT items.itemID, items.name AS itemName, items.description, items.image, items.ownerEmail, users.name AS ownerName
        FROM items
        INNER JOIN users ON items.ownerEmail = users.email
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.render('items', { items: results, user: req.session.user });
    });
});

// Handle item editing form submission
app.post('/items/edit/:itemID', upload.single('image'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const itemID = req.params.itemID;
    const { name, description } = req.body;
    let image = req.file ? '/images/' + req.file.filename : null;

    // Retrieve the current item to check if an image is already set
    const selectSql = 'SELECT * FROM items WHERE itemID = ?';
    connection.query(selectSql, [itemID], (err, results) => {
        if (err) {
            console.error('Error fetching item:', err);
            return res.status(500).send('Server Error');
        }

        const item = results[0];
        if (!item) {
            return res.status(404).send('Item not found');
        }

        // Check if the current user is the owner of the item
        if (item.ownerEmail !== req.session.user.email) {
            return res.status(403).send('Forbidden: You do not own this item');
        }

        // If no new image is uploaded, keep the existing image
        if (!image) {
            image = item.image;
        }

        // Update the item with new details
        const updateSql = 'UPDATE items SET name = ?, description = ?, image = ? WHERE itemID = ?';
        connection.query(updateSql, [name, description, image, itemID], (err) => {
            if (err) {
                console.error('Error updating item:', err);
                return res.status(500).send('Server Error');
            }

            res.redirect('/items');
        });
    });
});

// Handle item update page
app.get('/items/edit/:itemID', (req, res) => {
    const { itemID } = req.params;

    if (!req.session.user) {
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM items WHERE itemID = ?';
    connection.query(sql, [itemID], (err, results) => {
        if (err) {
            console.error('Error fetching item:', err);
            return res.status(500).send('Server Error');
        }

        if (results.length === 0) {
            return res.status(404).send('Item not found');
        }

        const item = results[0];
        if (item.ownerEmail !== req.session.user.email) {
            return res.status(403).send('Forbidden');
        }

        res.render('edititem', { item, user: req.session.user });
    });
});

// Handle item deletion
app.post('/items/delete/:itemID', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const { itemID } = req.params;

    const sql = 'SELECT * FROM items WHERE itemID = ?';
    connection.query(sql, [itemID], (err, results) => {
        if (err) {
            console.error('Error fetching item:', err);
            return res.status(500).send('Server Error');
        }

        const item = results[0];
        if (!item) {
            return res.status(404).send('Item not found');
        }

        if (item.ownerEmail !== req.session.user.email) {
            return res.status(403).send('Forbidden: You do not own this item');
        }

        const deleteSql = 'DELETE FROM items WHERE itemID = ?';
        connection.query(deleteSql, [itemID], (err) => {
            if (err) {
                console.error('Error deleting item:', err);
                return res.status(500).send('Server Error');
            }
            res.redirect('/items');
        });
    });
});

// List new item page
app.get('/list', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('list');
});

// Handle item listing form submission
app.post('/list', upload.single('image'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const { name, description } = req.body;
    const image = req.file ? '/images/' + req.file.filename : null;

    // Validate that an image was uploaded
    if (!image) {
        return res.status(400).send('Image upload is required');
    }

    const sql = 'INSERT INTO items (name, description, image, ownerEmail) VALUES (?, ?, ?, ?)';
    connection.query(sql, [name, description, image, req.session.user.email], (err) => {
        if (err) {
            console.error('Error listing item:', err);
            res.status(500).send('Server Error');
            return;
        }
        res.redirect('/items');
    });
});

// Register page
app.get('/register', (req, res) => {
    res.render('register');
});

// Handle registration form submission
app.post('/register', upload.single('profileimage'), (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    const profileimage = req.file ? '/images/' + req.file.filename : null;

    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }
    // Simple validation
    if (!name || !email || !password || !confirm_password) {
        return res.status(400).send('All fields are required');
    }

    // Check if the email already exists
    const checkSql = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error('Error checking existing user:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            return res.status(400).send('Email already exists');
        }

        // Hash password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Server error');
            }

            // Insert user into the database    
            const sql = 'INSERT INTO users (name, email, password, profileimage) VALUES (?, ?, ?, ?)';
            connection.query(sql, [name, email, hashedPassword, profileimage], (err) => {
                if (err) {
                    console.error('Error registering user:', err);
                    return res.status(500).send('Server error');
                }
                res.redirect('/login'); // Redirect to login page after successful registration
            });
        });
    });
});

// Login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check user credentials
    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Server Error');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = results[0];

        // Compare passwords
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Server Error');
            }

            if (isMatch) {
                // Save user info in session
                req.session.user = user;
                res.redirect('/'); // Redirect to home page after successful login
            } else {
                res.status(401).send('Invalid email or password');
            }
        });
    });
});

// Profile page
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('profile', { user: req.session.user, passwordUpdated: false });
});

// Handle password change form submission
app.post('/profile/change-password', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const { current_password, new_password, confirm_new_password } = req.body;

    if (new_password !== confirm_new_password) {
        return res.status(400).send('New passwords do not match');
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [req.session.user.email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Server Error');
        }

        const user = results[0];

        bcrypt.compare(current_password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Server Error');
            }

            if (!isMatch) {
                return res.status(401).send('Current password is incorrect');
            }

            bcrypt.hash(new_password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing new password:', err);
                    return res.status(500).send('Server Error');
                }

                const updateSql = 'UPDATE users SET password = ? WHERE email = ?';
                connection.query(updateSql, [hashedPassword, user.email], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.status(500).send('Server Error');
                    }

                    res.render('profile', { user: req.session.user, passwordUpdated: true });
                });
            });
        });
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/');
    });
});

// Item details page
app.get('/itemdetails/:itemID', (req, res) => {
    const { itemID } = req.params;
    const sql = 'SELECT * FROM items WHERE itemID = ?';
    connection.query(sql, [itemID], (err, results) => {
        if (err) {
            console.error('Error fetching item details:', err);
            res.status(500).send('Server Error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Item not found');
            return;
        }
        res.render('itemdetails', { item: results[0] });
    });
});

// Render main page
app.get('/main', (req, res) => {
    res.render('main');
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    res.send('File uploaded successfully');
});

// Cart page
app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart });
});

// Add item to cart
app.post('/cart/add/:itemID', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const { itemID } = req.params;
    const sql = 'SELECT * FROM items WHERE itemID = ?';
    connection.query(sql, [itemID], (err, results) => {
        if (err) {
            console.error('Error fetching item:', err);
            return res.status(500).send('Server Error');
        }

        if (results.length === 0) {
            return res.status(404).send('Item not found');
        }

        const item = results[0];
        const cart = req.session.cart || [];
        cart.push(item);
        req.session.cart = cart;

        res.redirect('/cart');
    });
});

// Remove item from cart
app.post('/cart/remove/:itemID', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const { itemID } = req.params;
    const cart = req.session.cart || [];
    const updatedCart = cart.filter(item => item.itemID !== parseInt(itemID, 10));

    req.session.cart = updatedCart;
    res.redirect('/cart');
});


app.get('/checkout', (req, res) => {
    res.render('checkout');
});

app.post('/checkout', (req, res) => {
    // Handle payment processing here
    console.log(req.body);
    res.send('Payment processed');
});

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

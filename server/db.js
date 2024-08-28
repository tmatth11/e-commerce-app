const Client = require('pg');

// Set up the connection to the database
const connectionOptions = {
    host: 'localhost',
    port: 5433,
    user: 'root',
    password: 'root',
    database: 'e_commerce_app'
};

// Create a new client
const dbClient = new Client.Client(connectionOptions);

// Connect to the database
dbClient.connect(() => {
    console.log('Connected to postgres db!');
});

module.exports = dbClient;
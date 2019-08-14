var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon_db"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    queryAllProducts();

});

//===================all producte======================
function queryAllProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price);
        }
        console.log("-----------------------------------");
        postAuction();
    })
   
}
    

//=============Question==================================================
function postAuction() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the id you would like to buy?"
        },
        {
            name: "quantity",
            type: "input",
            message: " how many units of the product they would like to buy?"
        }
    ]).then(function (input) {
        // console.log('Customer has selected: \n    item_id = '  + input.item_id + '\n    quantity = ' + input.quantity);

        var item = input.id;
        var quantity = input.quantity;

        // Query db to confirm that the given item ID exists in the desired quantity
        var queryStr = 'SELECT * FROM products WHERE ?';

        connection.query(queryStr, { id: item }, function (err, data) {
            if (data.length === 0) {
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');

            } else {
                var productData = data[0];
                if (quantity <= productData.stock_quantity) {
                    console.log('Congratulations, the product you requested is in stock! Placing order!');

                    // Construct the updating query string
                    var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE id = ' + item;
                    console.log(updateQueryStr)
                    connection.query(updateQueryStr, function (err, data) {
                        if (err) throw err;
                        connection.end();
                    })
                } else {
                    console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
                    console.log('Please modify your order.');
                    console.log("\n---------------------------------------------------------------------\n");
                }
            }
        })
    })
}


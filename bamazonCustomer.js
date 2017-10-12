var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    database: "bamazon"
});



connection.connect(function(err) {
  if (err) throw err;
 // console.log('connected');
 start();
});

function start () {
	connection.query('SELECT * FROM products', function(err, res) {

		var table = new Table({
			    head: ['Item ID', 'Product',  'Department', 'Price', 'Stock']
			});
			 
		 for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price.toFixed(2), res[i].stock_quantity]);
        }
			// table is an Array, so you can `push`, `unshift`, `splice` and friends 
			console.log(table.toString());

		inquirer.prompt([{
            name: "id",
            type: "input",
            message: "Please enter Item ID of product you want to purchase?",
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            name: "quantity",
            type: "input",
            message: "How many units would you like to purchase?",
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
            }]).then(function(answer) {
	            var purchaseId = answer.id - 1
	            var purchaseProduct = res[purchaseId]
	            var purchaseQuantity = answer.quantity
	            if (purchaseQuantity < res[purchaseId].stock_quantity) {
	                console.log("Your total for " + purchaseQuantity  + res[purchaseId].product_name + " is " + res[purchaseId].price.toFixed(2) * purchaseQuantity);
	                connection.query("UPDATE products SET ? WHERE ?", [{
	                    stock_quantity: res[purchaseId].stock_quantity - purchaseQuantity
	                }, {
	                    id: res[purchaseId].id
	                }], function(err, res) {
	                	start();
	                 
	                });

	            } else {
	                console.log("Insufficient quantity! Check back when stock has been replenished.");
	               		start();
		            }
	        	})
		})
};
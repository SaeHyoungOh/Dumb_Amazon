module.exports = function () {
	var express = require('express');
	var router = express.Router();

		function getProduct(res, mysql, context, complete) {
			mysql.pool.query("SELECT id, name, price, inventory, category_id FROM product", function (error, results, fields) {
				if (error) {
					res.write(JSON.stringify(error));
					res.end();
				}
				context.product = results;
				complete();
			});
		}

		function getCategories(res, mysql, context, complete) {
			mysql.pool.query("SELECT id, name FROM categories", function (error, results, fields) {
				if (error) {
					res.write(JSON.stringify(error));
					res.end();
				}
				context.categories = results;
				complete();
			});
		}

	/* Find product whose name includes the given string in the req */
	function searchFunction(req, res, mysql, context, complete) {
		//sanitize the input as well as include the % character
		var query = "SELECT id, name, price, inventory, category_id FROM product WHERE " + req.query.filter + " LIKE " + mysql.pool.escape('%' + req.query.search + '%');
		console.log(query)
		mysql.pool.query(query, function (error, results, fields) {
			if (error) {
				res.write(JSON.stringify(error));
				res.end();
			}
			context.product = results;
			complete();
		});
	}

	/*Display all product. Requires web based javascript to delete users with AJAX*/
	router.get('/', function (req, res) {
		var callbackCount = 0;
		var context = {};
		var mysql = req.app.get('mysql');
		getProduct(res, mysql, context, complete);
		getCategories(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if (callbackCount >= 2) {
				res.render('product', context);
			}

		}
	});

	/*Display all product whose name starts with a given string. */
	router.get('/search', function (req, res) {
		var callbackCount = 0;
		var context = {};
		var mysql = req.app.get('mysql');

		searchFunction(req, res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if (callbackCount >= 1) {
				res.render('product', context);
			}
		}
	});

	/* Adds a categories, redirects to the product page after adding */
	router.post('/add', function (req, res) {
		console.log(req.body)
		var mysql = req.app.get('mysql');
		var sql = "INSERT INTO product (name, price, inventory, category_id) VALUES (?, ?, ?, ?)";
		var inserts = [req.body.newProductName, req.body.newPrice, req.body.newInventory,
			req.body.newCategory];
		sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
			if (error) {
				console.log(JSON.stringify(error))
				res.write(JSON.stringify(error));
				res.end();
			} else {
				res.redirect('/product');
			}
		});
	});

	/* updates a product, redirects to the product page after adding */
	router.post('/update', function (req, res) {
		console.log(req.body)
		var mysql = req.app.get('mysql');
		var sql = "UPDATE product SET name=?, price=?, inventory=?, category_id=? WHERE id = ?";
		var inserts = [req.body.editName, req.body.editPrice, req.body.editInventory,
			req.body.updateCategory, req.body.updateID];
		sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
			if (error) {
				console.log(JSON.stringify(error))
				res.write(JSON.stringify(error));
				res.end();
			} else {
				res.redirect('/product');
			}
		});
	});

	/* delete a product, redirects to the product page after deleting */
	router.post('/delete', function (req, res) {
		var mysql = req.app.get('mysql');
		var sql = "DELETE FROM product WHERE id = ?";
		var inserts = [req.body.deleteID];
		sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
			if (error) {
				console.log(error)
				res.write(JSON.stringify(error));
				res.status(400);
				res.end();
			} else {
				res.redirect('/product');
			}
		})
	})

	return router;
}();

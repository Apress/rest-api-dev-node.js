

module.exports = {
	"id": "BookSale",
	"properties": {
		"date": {
			"type":"date",
			"description": "Date of the transaction"
		},
		"books": {
			"type": "array",
			"description": "Books sold",
			"items": {
				"$ref": "Book"
			}
		},
		"store": {
			"type": "object",
			"description": "The store where this sale took place",
			"type": "object",
			"$ref": "Store"
		},
		"employee": {
			"type": "object",
			"description": "The employee who makes the sale",
			"$ref": "Employee"
		},
		"client": {
			"type": "object",
			"description": "The person who gets the books",
			"$ref": "Client",
		},
		"totalAmount": {
			"type": "integer"
		}

	}
}
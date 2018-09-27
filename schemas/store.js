module.exports = {
	"id": "Store",
	"properties": {
		"name": {
			"type": "string",
			"description": "The actual name of the store"
		},
		"address": {
			"type": "string",
			"description": "The address of the store"
		},
		"state": {
			"type": "string",
			"description": "The state where the store resides"
		},
		"phone_numbers": {
			"type": "array",
			"description": "List of phone numbers for the store",
			"items": {
				"type": "string"
			}
		},
		"employees": {
			"type": "array",
			"description": "List of employees of the store",
			"items": {
				"$ref": "Employee"
			}
		}
	}
}
	
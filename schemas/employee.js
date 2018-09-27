module.exports = {
	"id": "Employee",
	"properties": {
		"first_name": {
			"type": "string",
			"description": "First name of the employee"
		},
		"last_name": {
			"type": "string",
			"description": "Last name of the employee"
		},
		"birthdate": {
			"type": "string",
			"description": "Date of birth of this employee"
		},
		"address": {
			"type": "string",
			"description": "Address for the employee"
		},
		"phone_numbers": {
			"type": "array",
			"description": "List of phone numbers of this employee",
			"items": {
				"type": "string"
			}
		},
		"email": {
			"type": "string",
			"description": "Employee's email"
		},
		"hire_date": {
			"type": "string",
			"description": "Date when this employee was hired"
		},
		"employee_number": {
			"type": "number",
			"description": "Unique identifier of the employee"
		}
	}
}
	
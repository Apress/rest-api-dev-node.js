module.exports = {
	"id": "ClientReview",
	"properties": {
		"client": {
			"$ref": "Client",
			"description": "The client who submits the review"
		},
		"book": {
			"$ref": "Book",
			"description": "The book being reviewed"
		},
		"review_text": {
			"type": "string",
			"description": "The actual review text"
		},
		"stars": {
			"type": "integer",
			"description": "The number of stars, from 0 to 5",
			"min": 0,
			"max": 5
		}
	}
}


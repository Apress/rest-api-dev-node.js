

module.exports = function(db) {
	return {
		"Book": require("./book")(db),
		"Booksale": require("./booksale")(db),
		"Client": require("./client")(db),
		"ClientReview": require("./clientreview")(db),
		"Employee": require("./employee")(db),
		"Store": require("./store")(db),
		"Author": require("./author")(db)
	}
}
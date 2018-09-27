

module.exports = {

  getbooksales: {
    validate: 'params',
    schema: {
      type: "object",
      properties: {
        start_date: {
          type: 'string',
          format:'date'
        },
        end_date: {
          type: 'string',
          format:'date'
        },
        store_id: {
          type: 'string'
        }
      }
    }
  }    
}
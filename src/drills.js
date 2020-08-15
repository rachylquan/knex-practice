require('dotenv').config()
const knex = require('knex')

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL
})

function searchShoppingList(searchTerm) {
  knexInstance
    .select('name')
    .from('shopping_list')
    .where('name', 'ILIKE', `%${searchTerm}%`)
    .then(result => {
      console.log(result)
    })
}

searchShoppingList('fish')

function paginateShoppingList(page) {
  const itemsPerPage = 6
  const offset = itemsPerPage * (page - 1)
  knexInstance
    .select('id', 'name', 'price', 'checked', 'category')
    .from('shopping_list')
    .limit(itemsPerPage)
    .offset(offset)
    .then(result => {
      console.log(result)
    })
}

paginateShoppingList(4)

function itemsAddedDaysAgo(daysAgo) {
  knexInstance
    .select('name')
    .from('shopping_list')
    .where(
      'date_added',
      '>',
      knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo)
    )
    .then(result => {
      console.log('Products added days ago')
      console.log(result)
    })
}

itemsAddedDaysAgo(2)

function getCostPerCategory() {
  knexInstance
    .select('category')
    .sum('price AS total')
    .from('shopping_list')
    .groupBy('category')
    .then(result => {
      console.log(result)
    })
}

getCostPerCategory()
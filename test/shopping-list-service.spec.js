const ShoppingListService = require('../src/shopping-list-service')
const knex = require('knex')

describe(`Shopping List service object`, function() {
  let db
  let testShoppingList = [
    {
      id: 1,
      name: 'First Test Item',
      price: '9.15',
      category: 'Lunch',
      checked: true,
      date_added: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      name: 'Second Test Item',
      price: '5.50',
      category: 'Snack',
      checked: false,
      date_added: new Date('2029-01-21T16:28:32.615Z')
    },
    {
      id: 3,
      name: 'Third Test Item',
      price: '10.00',
      category: 'Main',
      checked: true,
      date_added: new Date('2029-01-15T16:28:32.615Z')
    },
    {
      id: 4,
      name: 'Fourth Test Item',
      price: '5.25',
      category: 'Breakfast',
      checked: false,
      date_added: new Date('2029-01-10T16:28:32.615Z')
    }
  ]

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })

  before(() => db('shopping_list').truncate())

  afterEach(() => db('shopping_list').truncate())

  after(() => db.destroy())

  context(`Given 'shopping_list' has data`, () => {
    beforeEach(() => {
      return db
        .into('shopping_list')
        .insert(testShoppingList)
    })

    it(`getShoppingList() resolves all items from 'shopping_list' table`, () => {
      // test that ShoppingListService.getShoppingList gets data from table
      return ShoppingListService.getShoppingList(db)
        .then(actual => {
          expect(actual).to.eql(testShoppingList.map(item => ({
            ...item,
            date_added: new Date(item.date_added)
          })))
        })
    })

    it(`getById() resolves an item by id from 'shopping_list' table`, () => {
      const thirdId = 3
      const thirdTestItem = testShoppingList[thirdId - 1]
      return ShoppingListService.getById(db, thirdId)
        .then(actual => {
          expect(actual).to.eql({
            id: thirdId,
            name: thirdTestItem.name,
            price: thirdTestItem.price,
            category: thirdTestItem.category,
            checked: thirdTestItem.checked,
            date_added: thirdTestItem.date_added
          })
        })
    })

    it(`deletedItem() removes an item by id from 'shopping_list' table`, () => {
      const itemId = 3
      return ShoppingListService.deleteItem(db, itemId)
        .then(() => ShoppingListService.getShoppingList(db))
        .then(ShoppingList => {
          // copy the test list array without the "deleted" article
          const expected = testShoppingList.filter(item => item.id !== itemId)
          expect(ShoppingList).to.eql(expected)
        })
    })

    it(`updateItem() updates an item fromt the 'shopping_list' table`, () => {
      const idOfItemToUpdate = 3
      const newItemData = {
        name: 'Updated Item',
        price: '12.00',
        category: 'Breakfast',
        checked: false,
        date_added: new Date()
      }
      return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
        .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
        .then(item => {
          expect(item).to.eql({
            id: idOfItemToUpdate,
            ...newItemData
          })
        })
    })

  })

  context(`Given 'shopping_list has no data`, () => {
    it(`getShoppingList() resolves an empty array`, () => {
      return ShoppingListService.getShoppingList(db)
        .then(actual => {
          expect(actual).to.eql([])
        })
    })
  })

  it(`insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
    const newItem = {
      name: 'Test new name',
      price: '5.15',
      category: 'Snack',
      checked: false,
      date_added: new Date('2020-01-01T00:00:00.000Z')
    }
    return ShoppingListService.insertItem(db, newItem)
      .then(actual => {
        expect(actual).to.eql({
          id: 1,
          name: newItem.name,
          price: newItem.price,
          category: newItem.category,
          checked: newItem.checked,
          date_added: new Date(newItem.date_added)
        })
      })
  })

})
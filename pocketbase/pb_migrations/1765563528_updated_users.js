/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number2398012259",
    "max": null,
    "min": null,
    "name": "total_playtime_seconds",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number3409733176",
    "max": null,
    "min": null,
    "name": "words_explained_total",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number3868681339",
    "max": null,
    "min": null,
    "name": "words_guessed_total",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "number3060091390",
    "max": null,
    "min": null,
    "name": "max_explained_per_round",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "number818465947",
    "max": null,
    "min": null,
    "name": "max_guessed_per_round",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "number970903046",
    "max": null,
    "min": null,
    "name": "max_score_per_game",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "number1934701372",
    "max": null,
    "min": null,
    "name": "mvp_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("number2398012259")

  // remove field
  collection.fields.removeById("number3409733176")

  // remove field
  collection.fields.removeById("number3868681339")

  // remove field
  collection.fields.removeById("number3060091390")

  // remove field
  collection.fields.removeById("number818465947")

  // remove field
  collection.fields.removeById("number970903046")

  // remove field
  collection.fields.removeById("number1934701372")

  return app.save(collection)
})

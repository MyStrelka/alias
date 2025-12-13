/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_");

    // add field
    collection.fields.addAt(
      8,
      new Field({
        hidden: false,
        id: "number2934251649",
        max: null,
        min: null,
        name: "games_played",
        onlyInt: false,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      }),
    );

    // add field
    collection.fields.addAt(
      9,
      new Field({
        hidden: false,
        id: "number1155476259",
        max: null,
        min: null,
        name: "games_won",
        onlyInt: false,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      }),
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_");

    // remove field
    collection.fields.removeById("number2934251649");

    // remove field
    collection.fields.removeById("number1155476259");

    return app.save(collection);
  },
);

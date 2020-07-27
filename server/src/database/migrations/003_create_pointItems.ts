import Knex from  'knex';

export async function up(knex: Knex){
        return  knex.schema.createTable('Point_Items', table => {
        table.increments('id').primary();
        table.integer('point_id').notNullable().references('id').inTable('Points');
        table.integer('item_id').notNullable().references('id').inTable('Items');
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('Point_Items');
}
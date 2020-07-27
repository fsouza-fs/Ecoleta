import Knex from 'knex';

export async function seed(knex: Knex){
    await knex('Items').insert([
        { title: 'Lâmpadas', image: 'lampada.svg' },
        { title: 'Pilhas e baterias', image: 'baterias.svg' },
        { title: 'Papéis e papelão', image: 'papeis.svg' },
        { title: 'Resíduos eletrônicos', image: 'eletronicos.svg' },
        { title: 'Resíduos orgânicos', image: 'organicos.svg' },
        { title: 'Óleo de cozinha', image: 'oleo.svg' },

    ]);
}
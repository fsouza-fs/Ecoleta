import knex from '../database/connections';
import {Request, Response} from 'express';

class PointController{
    async createPoints(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items,
        } = request.body;
    
        const trx = await knex.transaction();

        const point = {
            image: 'https://images.unsplash.com/photo-1540661116512-12e516d30ce4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        }

        const insertedIds = await trx('Points').insert(point);
        
        const point_id = insertedIds[0];
    
        const pointItem = items.map((item_id: number) => {
            return {
                item_id,
                point_id,
            };
        });

        await trx('Point_Items').insert(pointItem);
        
        await trx.commit();

        return response.json({
            id: point_id,
            ...point,
        })
    }

    async show(request: Request, response: Response){
        const id = request.params.id;
        const point = await knex('Points').where('id',id).first();

        if(!point){
            return response.status(400).json({message: 'point not found'});
        }

        const items = await knex('Items').join('Point_Items', 'Items.id', '=', 'Point_Items.item_id').where(
            'Point_Items.point_id', id
        ).select('Items.title');

        return response.json({point, items});
    }

    async index(request: Request, response: Response){
        const {city, uf, items} = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('Points')
        .join('Point_Items', 'Points.id', '=', 'Point_Items.point_id')
        .whereIn('Point_Items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('Points.*');

        return response.json(points);
    }
}

export default PointController;
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          product_id: item.productId,
          order_id: entity.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price              
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    try {
      let sequelize = OrderModel.sequelize;
    
      const items = entity.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        order_id: entity.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
      }));
      
      await sequelize.transaction(async t => {
        await OrderItemModel.destroy({ where: { order_id: entity.id }, transaction: t });
        await OrderItemModel.bulkCreate(items, { transaction: t });
        await OrderModel.update({ total: entity.total() }, { where: { id: entity.id }, transaction: t });
      });
    } catch (error) {
      throw new Error(`Failed to update order, ${error}`);
    }
  }

  async find(id: string): Promise<Order> {
    let orderModel, order;
    let orderItems: OrderItem[] = [];    

    try {
      orderModel = await OrderModel.findOne({
        where: { 
          id: id, 
        },
        include: [{
          model: OrderItemModel,
          attributes: ['id', 'product_id', 'quantity', 'name', 'price']
        }],
        rejectOnEmpty: true,
      });
      
      orderModel.items.forEach((item) => {
        let oItem = new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity);
        orderItems.push(oItem);
      });

      order = new Order(orderModel.id, orderModel.customer_id, orderItems);
    } catch (error) {
      throw new Error(`Order not found, ${error}`);
    }
        
    return order;
  }

  async findAll(): Promise<Order[]> {
    let orderModels;
    try {
      orderModels = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });
    } catch (error) {
      throw new Error(`Failed to load All Orders, ${error}`);
    }
    
    return orderModels.map(orderModel => 
      new Order(
        orderModel.id,
        orderModel.customer_id,
        orderModel.items.map(orderItem =>           
          new OrderItem(orderItem.id, orderItem.name, orderItem.price, orderItem.product_id, orderItem.quantity)
        )
      )
    );
  }
}

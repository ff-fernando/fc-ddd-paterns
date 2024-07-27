import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerUpdateAddressEvent from "../customer-update-address.event";

export default class SendConsoleLogHandler
  implements EventHandlerInterface<CustomerUpdateAddressEvent>
{
  handle(event: CustomerUpdateAddressEvent): void {
    console.log(`Endereço do cliente: 
      ${event.eventData.id}, 
      ${event.eventData.name} 
      alterado para: 
      ${JSON.stringify(event.eventData.Address)}`); 
  }
}
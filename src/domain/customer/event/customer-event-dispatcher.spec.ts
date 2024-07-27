import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import SendConsoleLog1Handler from "./handler/send-console-log-1.handler";
import SendConsoleLog2Handler from "./handler/send-console-log-2.handler";
import SendConsoleLogHandler from "./handler/send-console-log.handler";
import CustomerUpdateAddressEvent from "./customer-update-address.event";

describe("Customer events tests", () => {
  it("should register two events handler", () => {
    const eventDispatcher = new EventDispatcher();
    const customerEventHandler1 = new SendConsoleLog1Handler();
    const customerEventHandler2 = new SendConsoleLog2Handler();

    eventDispatcher.register("CustomerCreatedEvent", customerEventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", customerEventHandler2);
    
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toBeDefined();
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length).toBe(2);
  });
  
  it("should notify the customer when changing the address", () => {
    const eventDispatcher = new EventDispatcher();
    const eventConsoleLogHandler = new SendConsoleLogHandler();
    const spyEventConsoleLogHandler = jest.spyOn(eventConsoleLogHandler, "handle");

    eventDispatcher.register("CustomerUpdateAddressEvent", eventConsoleLogHandler);

    expect(eventDispatcher.getEventHandlers["CustomerUpdateAddressEvent"][0]).toMatchObject(eventConsoleLogHandler);

    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode A-1", "City 1");
    customer.Address = address;
    
    const newAddress = new Address("Street 2", 2, "Zipcode A-2", "city 2");
    customer.changeAddress(newAddress)

    const customerUpdateAddressEvent = new CustomerUpdateAddressEvent(customer);

    eventDispatcher.notify(customerUpdateAddressEvent);

    expect(spyEventConsoleLogHandler).toHaveBeenCalled();
  });
});
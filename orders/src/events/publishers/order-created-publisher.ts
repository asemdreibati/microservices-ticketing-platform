import { Publisher, OrderCreatedEvent, Subjects } from "@aaticketsaa/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

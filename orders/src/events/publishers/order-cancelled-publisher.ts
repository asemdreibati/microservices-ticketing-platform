import { Subjects, Publisher, OrderCancelledEvent } from "@aaticketsaa/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

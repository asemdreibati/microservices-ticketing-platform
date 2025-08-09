import { Subjects, Publisher, PaymentCreatedEvent } from "@aaticketsaa/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

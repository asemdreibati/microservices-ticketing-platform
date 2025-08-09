import { Publisher, Subjects, TicketUpdatedEvent } from "@aaticketsaa/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

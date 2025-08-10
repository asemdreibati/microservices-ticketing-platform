"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import useRequest from "../../../hooks/use-request";

const TicketEdit = ({ ticket }) => {
  const router = useRouter();
  const [title, setTitle] = useState(ticket?.title || "");
  const [price, setPrice] = useState(ticket?.price || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { doRequest, errors } = useRequest({
    url: `/api/tickets/${ticket.id}`,
    method: "put",
    body: { title, price },
    onSuccess: () => router.push("/"),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await doRequest();
    setIsSubmitting(false);
  };

  return (
    <div>
      <h1>Edit Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
            type="number"
            step="0.01"
            min="0"
          />
        </div>
        {errors}
        <button className="btn btn-primary mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
};

TicketEdit.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketEdit;

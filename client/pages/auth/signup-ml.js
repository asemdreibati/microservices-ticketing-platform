import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const SignUpML = () => {
  const [email, setEmail] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signup-with-magic-links",
    method: "post",
    body: {
      email,
    },
    onSuccess: () => Router.push("/auth/email-sent"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary mt-2">Sign Up</button>
    </form>
  );
};
export default SignUpML;

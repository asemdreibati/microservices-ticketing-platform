import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const SignUpML = () => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
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
    setLoader(true);
    try {
      await doRequest();
    } finally {
      setLoader(false);
    }
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
      <button className="btn btn-primary mt-2" type="submit" disabled={loader}>
        {loader && (
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          ></span>
        )}
        <span role="status">Sign Up</span>
      </button>
    </form>
  );
};
export default SignUpML;

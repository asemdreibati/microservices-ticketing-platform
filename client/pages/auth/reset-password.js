import Router from "next/router";
import { useState } from "react";
import useRequest from "../../hooks/use-request";
import { useRouter } from "next/router";

const ResetingPassword = () => {
  const { query } = useRouter();
  const [loader, setLoader] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { doRequest, errors } = useRequest({
    url: "/api/users/reset-password",
    method: "post",
    onSuccess: () => {
      Router.push("/auth/signin");
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    const { token } = query;
    try {
      await doRequest({
        props: { newPassword, token },
      });
    } finally {
      setLoader(false);
    }
  };
  return (
    <>
      <div className="text-center">
        <h1 className="card-title h3">Reset Your Password</h1>
        <p className="card-text text-muted">Reset Your Password</p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span className="input-group-text password-toggle">
              <i className="fas fa-eye"></i>
            </span>
          </div>
        </div>
        {errors}
        <button
          type="submit"
          className="btn btn-login text-white"
          disabled={loader}
        >
          <span role="status">Reset</span>
          &nbsp;
          {loader && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
        </button>
      </form>
    </>
    // <section className="container mx-auto px-4 md:px-6 flex flex-col justify-center items-center h-screen">
    //   {!loader && !errors && (
    //     <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mt-10 text-center">
    //       Your Password has been successfully reseted
    //     </h1>
    //   )}

    //   {loader && !errors && (
    //     <div className="d-flex align-items-center">
    //       <div className="spinner-border text-primary" role="status">
    //         <span className="visually-hidden">Loading...</span>
    //       </div>
    //       Reseting Password ...
    //     </div>
    //   )}

    //   {errors}
    // </section>
  );
};
export default ResetingPassword;

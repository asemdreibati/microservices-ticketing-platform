import { useState, useEffect } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const TwoFactorPage = () => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/2fa/login",
    method: "post",
    body: {},
    onSuccess: () => {
      localStorage.removeItem("tempToken"); // ✅ clean it up
      Router.push("/");
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem("tempToken");
    if (!stored) {
      Router.push("/auth/signin");
    } else {
      setTempToken(stored);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    await doRequest({ props: { token, tempToken } });
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Two-Factor Authentication</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter 2FA code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Verify
        </button>
      </form>
      {errors}
    </div>
  );
};
export default TwoFactorPage;

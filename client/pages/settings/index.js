import Image from "next/image";
import { useState, useEffect } from "react";
import useRequest from "../../hooks/use-request";

const SettingsPage = ({ currentUser }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [setupToken, setSetupToken] = useState("");
  const [message, setMessage] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(false);

  const { doRequest: twoFaSetupRequestFn, twoFaSetupRequestError } = useRequest(
    {
      url: "/api/users/2fa/setup",
      method: "post",
      onSuccess: ({ qrCode }) => {
        setQrCode(qrCode);
        setLoadingSetup(false);
      },
    }
  );
  const { doRequest: verifySetupFn, verifySetupErrors } = useRequest({
    url: "/api/users/2fa/verify-setup",
    method: "post",
    onSuccess: () => {
      setTwoFactorEnabled(true);
      setQrCode(null);
      setSetupToken("");
    },
  });
  const { doRequest: disable2FAFn, disable2FAErrors } = useRequest({
    url: "/api/users/2fa/disable",
    method: "post",
    onSuccess: () => {
      setTwoFactorEnabled(false);
      setMessage("2FA disabled");
    },
  });
  const { doRequest: meFn, meError } = useRequest({
    url: "/api/users/me",
    method: "get",
    onSuccess: ({ currentUser }) => {
      console.log("currentUser", currentUser);
      setTwoFactorEnabled(currentUser?.twoFactorEnabled);
    },
  });
  useEffect(() => {
    meFn();
  }, []);

  const startSetup = async () => {
    setLoadingSetup(true);

    try {
      await twoFaSetupRequestFn();
    } finally {
      setLoadingSetup(false);
    }
  };

  const verifySetup = async () => {
    await verifySetupFn({ props: { token: setupToken } });
  };
  const disable2FA = async () => {
    await disable2FAFn();
  };
  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded mt-12">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>

      {verifySetupErrors}
      {twoFaSetupRequestError}
      {disable2FAErrors}
      {meError}
      {twoFactorEnabled ? (
        <div>
          <p className="mb-4 text-green-700">2FA is enabled ✅</p>
          <button onClick={disable2FA} className="btn btn-danger">
            Disable 2FA
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-yellow-700">2FA is not enabled ⚠️</p>
          {qrCode ? (
            <div>
              <Image
                src={qrCode}
                alt="Scan QR for 2FA"
                className="mb-4"
                width={200}
                height={200}
              />
              <input
                type="text"
                placeholder="Enter token"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
              />
              <button onClick={verifySetup} className="btn btn-success w-full">
                Verify and Enable 2FA
              </button>
            </div>
          ) : (
            <button
              onClick={startSetup}
              className="btn btn-warning"
              disabled={loadingSetup}
            >
              {loadingSetup ? "Loading..." : "Enable 2FA"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default SettingsPage;

import Image from "next/image";
import { useState, useEffect } from "react";
import useRequest from "../../hooks/use-request";

const SettingsPage = ({ currentUser }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [setupToken, setSetupToken] = useState("");
  const [message, setMessage] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [activeTab, setActiveTab] = useState("2fa");
  const [require2FAAfterMagicLink, setRequire2FAAfterMagicLink] =
    useState(false);

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
      setMessage("2FA has been successfully enabled");
    },
  });
  const { doRequest: disable2FAFn, disable2FAErrors } = useRequest({
    url: "/api/users/2fa/disable",
    method: "post",
    onSuccess: () => {
      setTwoFactorEnabled(false);
      setMessage("2FA has been disabled");
      if (require2FAAfterMagicLink) toggle2FAAfterMagicLinkFn();
    },
  });
  const { doRequest: meFn, meError } = useRequest({
    url: "/api/users/me",
    method: "get",
    onSuccess: ({ currentUser }) => {
      setTwoFactorEnabled(currentUser?.twoFactorEnabled);
      setRequire2FAAfterMagicLink(
        currentUser?.require2FAAfterMagicLink || false
      );
    },
  });

  const {
    doRequest: toggle2FAAfterMagicLinkFn,
    toggle2FAAfterMagicLinkErrors,
  } = useRequest({
    url: "/api/users/magic-link-after-2fa",
    method: "post",
    body: {
      enabled: !require2FAAfterMagicLink,
    },
    onSuccess: () => {
      setRequire2FAAfterMagicLink(!require2FAAfterMagicLink);
      if (activeTab != "2fa")
        //avoid setMesage concurrency issue
        setMessage(
          `2FA after Magic Link ${
            !require2FAAfterMagicLink ? "enabled" : "disabled"
          }`
        );
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
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-white py-3">
              <h1 className="h4 mb-0">Security Settings</h1>
            </div>

            <div className="card-body p-4">
              {/* Tab Navigation */}
              <ul className="nav nav-tabs nav-justified mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "2fa" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("2fa")}
                    type="button"
                    role="tab"
                  >
                    Two-Factor Authentication
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "magiclink" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("magiclink")}
                    type="button"
                    role="tab"
                  >
                    Magic Links
                  </button>
                </li>
              </ul>

              {/* Message Display */}
              {message && (
                <div
                  className="alert alert-success alert-dismissible fade show"
                  role="alert"
                >
                  {message}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage("")}
                  ></button>
                </div>
              )}

              {/* Error Display */}
              {(verifySetupErrors ||
                twoFaSetupRequestError ||
                disable2FAErrors ||
                meError ||
                toggle2FAAfterMagicLinkErrors) && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {verifySetupErrors ||
                    twoFaSetupRequestError ||
                    disable2FAErrors ||
                    meError ||
                    toggle2FAAfterMagicLinkErrors}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage("")}
                  ></button>
                </div>
              )}

              {/* 2FA Section */}
              {activeTab === "2fa" && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="h5 mb-1">Two-Factor Authentication</h2>
                      <p className="text-muted mb-0">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        twoFactorEnabled ? "bg-success" : "bg-warning"
                      }`}
                    >
                      {twoFactorEnabled ? "Enabled" : "Not Enabled"}
                    </span>
                  </div>

                  {twoFactorEnabled ? (
                    <div className="alert alert-success">
                      <div className="d-flex">
                        <div className="me-3">
                          <i className="bi bi-check-circle-fill text-success"></i>
                        </div>
                        <div>
                          <p className="mb-2">
                            2FA is currently enabled on your account.
                          </p>
                          <button
                            onClick={disable2FA}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Disable 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {qrCode ? (
                        <div className="border rounded p-4 bg-light">
                          <h3 className="h6 mb-3">Complete 2FA Setup</h3>
                          <p className="text-muted mb-3">
                            Scan this QR code with your authenticator app, then
                            enter the verification code below.
                          </p>
                          <div className="text-center mb-4">
                            <Image
                              src={qrCode}
                              alt="Scan QR for 2FA"
                              width={200}
                              height={200}
                              className="img-thumbnail"
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="token" className="form-label">
                              Verification Code
                            </label>
                            <input
                              id="token"
                              type="text"
                              placeholder="Enter 6-digit code"
                              value={setupToken}
                              onChange={(e) => setSetupToken(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <button
                            onClick={verifySetup}
                            className="btn btn-primary w-100"
                          >
                            Verify and Enable 2FA
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={startSetup}
                          disabled={loadingSetup}
                          className="btn btn-primary"
                        >
                          {loadingSetup ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Setting up...
                            </>
                          ) : (
                            "Set Up Two-Factor Authentication"
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Magic Links Section */}
              {activeTab === "magiclink" && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="h5 mb-1">Magic Links</h2>
                      <p className="text-muted mb-0">
                        Passwordless authentication with optional 2FA
                        requirement.
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        require2FAAfterMagicLink ? "bg-success" : "bg-warning"
                      }`}
                    >
                      {require2FAAfterMagicLink ? "Enabled" : "Not Enabled"}
                    </span>
                  </div>

                  {/* Magic Links Toggle */}
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="card-title mb-1">
                            Require 2FA After Magic Link
                          </h6>
                          <p className="card-text text-muted small mb-0">
                            Additional security layer after magic link
                            authentication
                          </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="2faAfterMagicLinkToggle"
                            checked={require2FAAfterMagicLink}
                            onChange={toggle2FAAfterMagicLinkFn}
                            style={{ transform: "scale(1.2)" }}
                            disabled={!twoFactorEnabled}
                          />
                        </div>
                      </div>
                      {!twoFactorEnabled && (
                        <div className="alert alert-warning mt-2 mb-0 py-2 small">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          You need to enable 2FA first to use this feature
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Information Card */}
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-info-circle me-2"></i>
                        How Magic Links Work
                      </h6>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <i className="bi bi-envelope-check text-primary me-2"></i>
                          Request a secure sign-in link sent to your email
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-shield-check text-primary me-2"></i>
                          Click the link to automatically authenticate
                        </li>
                        {require2FAAfterMagicLink ? (
                          <li className="mb-2">
                            <i className="bi bi-lock-fill text-success me-2"></i>
                            <strong>2FA required</strong> after magic link for
                            extra security
                          </li>
                        ) : (
                          <li className="mb-2">
                            <i className="bi bi-unlock text-warning me-2"></i>
                            No additional verification after magic link
                          </li>
                        )}
                        <li className="mb-2">
                          <i className="bi bi-clock text-primary me-2"></i>
                          Links expire after 15 minutes for security
                        </li>
                        <li>
                          <i className="bi bi-key text-primary me-2"></i>
                          No passwords to remember or manage
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="alert alert-info mt-3">
                    <i className="bi bi-shield-exclamation me-2"></i>
                    <strong>Security Note:</strong>{" "}
                    {require2FAAfterMagicLink
                      ? "With 2FA enabled after magic links, your account has maximum security protection."
                      : "Consider enabling 2FA after magic links for enhanced security."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
      />

      <style jsx>{`
        .nav-tabs .nav-link {
          color: #6c757d;
          font-weight: 500;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-color: #dee2e6 #dee2e6 #fff;
          font-weight: 600;
        }
        .card {
          border: 1px solid rgba(0, 0, 0, 0.125);
          border-radius: 0.5rem;
        }
        .card-header {
          border-bottom: 1px solid rgba(0, 0, 0, 0.125);
        }
        .form-check-input:disabled {
          background-color: #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;

import React from "react";

const SocialLoginButtons = () => {
  return (
    <>
      <button
        type="button"
        className="btn btn-social"
        onClick={() =>
          (window.location.href = "https://ticketing.dev/api/users/google")
        }
      >
        <i className="fab fa-google"></i>Google
      </button>
      <button
        type="button"
        className="btn btn-social"
        onClick={() =>
          (window.location.href = "https://ticketing.dev/api/users/github")
        }
      >
        <i className="fab fa-github"></i>Github
      </button>
    </>
  );
};

export default SocialLoginButtons;

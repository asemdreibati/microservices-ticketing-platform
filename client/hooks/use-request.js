import axios from "axios";
import { useState } from "react";

const constructUrlWithQueryParams = (url, params) => {
  let paramsStr = "";
  Object.keys(params).forEach((key, index) => {
    if (index == 0) paramsStr += "?";
    paramsStr += `${key}=${params[key]}`;
    if (index < params.length - 1) paramsStr += "&";
  });

  return url + paramsStr;
};

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}, params = {}) => {
    const modifiedUrl = constructUrlWithQueryParams(url, params);

    try {
      setErrors(null);
      const response = await axios[method](modifiedUrl, {
        ...body,
        ...props,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const errorContent = err?.response?.data?.errors ? (
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
            {err.response.data.message && <li>{err.response.data.message}</li>}
          </ul>
        </div>
      ) : (
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            <li>An unexpected error occurred</li>
          </ul>
        </div>
      );

      setErrors(errorContent);
    }
  };

  return { doRequest, errors };
};

export default useRequest;

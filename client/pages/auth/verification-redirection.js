import Router from "next/router";
import { useEffect, useState } from "react";
import useRequest from "../../hooks/use-request";
import { useRouter } from "next/router";

const VerificationRedirection = () => {
  const { query } = useRouter();
  const [loader, setLoader] = useState(true);
  const { doRequest, errors } = useRequest({
    url: "/api/users/verify-magic-links",
    method: "get",
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    const verifyToken = async () => {
      const { token } = query;

      if (token) {
        setTimeout(async () => {
          await doRequest({
            params: { token },
          });
          setLoader(false);
        }, 2000);
      } else {
        console.error("No token found in URL");
        setLoader(false);
      }
    };

    verifyToken();
  }, [query.token]); // Add dependency on query.token

  return (
    <section class="container mx-auto px-4 md:px-6 flex flex-col justify-center items-center h-screen">
      <h1 class="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mt-10 text-center">
        Your email has been successfully verified
      </h1>
      <p class="max-w-[600px] text-zinc-200 md:text-xl dark:text-zinc-100 text-center mx-auto">
        You're authorized Now
      </p>
      {loader && (
        <div className="d-flex align-items-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          You Will redirected To the App soon
        </div>
      )}
      {errors}
    </section>
  );
};
export default VerificationRedirection;

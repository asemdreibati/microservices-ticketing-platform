import Router from "next/router";
import { useEffect, useState } from "react";

const VerificationRedirection = () => {
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      Router.push("/");
      setLoader(false);
    }, 2000);
  }, []);

  return (
    <section className="container mx-auto px-4 md:px-6 flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mt-10 text-center">
        Your are logged in
      </h1>
      <p className="max-w-[600px] text-zinc-200 md:text-xl dark:text-zinc-100 text-center mx-auto">
        Redirecting...
      </p>
      {loader && (
        <div className="d-flex align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          You Will redirected To the App soon
        </div>
      )}
    </section>
  );
};
export default VerificationRedirection;

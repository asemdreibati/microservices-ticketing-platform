const EmailSent = () => {
  return (
    <section className="container mx-auto px-4 md:px-6 flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mt-10 text-center">
        Email Verification Successful
      </h1>
      <p className="max-w-[600px] text-zinc-200 md:text-xl dark:text-zinc-100 text-center mx-auto">
        Your email has been successfully verified. Please return to the login
        page.
      </p>
    </section>
  );
};
export default EmailSent;

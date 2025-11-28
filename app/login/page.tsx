export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background-color)]">
      <main className="flex min-h-fit w-fit max-w-3xl flex-col items-center justify-between py-10 px-9 bg-[var(--foreground-color)] shadow-lg rounded-xl">
        <form>
          <input type="email" name="email" placeholder="Email" required className="mb-4 w-full rounded-lg border border-gray-300 p-3 text-gray-900 dark:bg-gray-800 dark:text-white" />
          <input type="password" name="password" placeholder="Password" required className="mb-4 w-full rounded-lg border border-gray-300 p-3 text-gray-900 dark:bg-gray-800 dark:text-white" />
          <button type="submit" className="w-full rounded-lg bg-[var(--primary-color)] p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Login
          </button>          
        </form>
       
      </main>
    </div>
  );
}   
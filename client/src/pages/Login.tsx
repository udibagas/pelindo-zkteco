export default function Login() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())
    console.log(data)
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-slate-50">

      <form onSubmit={handleSubmit} className="flex flex-col w-[320px] mx-auto mt-8 gap-8 shadow-lg p-8 rounded-lg bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Login</h1>
          <p className="text-gray-500">Login to your account</p>
        </div>
        <div>
          <label htmlFor="username" className="text-slate-600 block mb-2">Username</label>
          <input type="text" id="username" name="username" className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label htmlFor="password" className="text-slate-600 block mb-2">Password</label>
          <input type="password" id="password" name="password" className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg">Login</button>
      </form>
    </main>

  )
}
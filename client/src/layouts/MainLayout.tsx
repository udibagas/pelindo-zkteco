import { NavLink, Outlet, useNavigate } from "react-router";

export default function MainLayout() {
  const navigate = useNavigate()

  function logout(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <>
      <header className="bg-blue-200 text-slate-600 py-0 px-6 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <span className="font-bold">Driver Access Monitoring</span>
          <NavLink to="/" className={({ isActive }) => isActive ? 'bg-blue-500 text-white p-4' : ''}>Live Preview</NavLink>
          <NavLink to="/access-log">Access Log</NavLink>
        </div>

        <div>
          <a href="#" onClick={logout}>Logout</a>
        </div>
      </header >
      <main className="max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
    </>
  )
}
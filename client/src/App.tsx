import { BrowserRouter, Route, Routes } from 'react-router'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Home from './pages/Home'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path='about' element={<h1>About</h1>} />
        </Route>

        <Route path='/login' element={<Login />} />
        <Route path='*' element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

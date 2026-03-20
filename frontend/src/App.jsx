import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-10 p-6">

      {/* HERO */}
      <section className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <img src={heroImg} className="w-40" alt="" />
          <img src={reactLogo} className="w-12 absolute -left-10 top-0" alt="React logo" />
          <img src={viteLogo} className="w-12 absolute -right-10 bottom-0" alt="Vite logo" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold">Get started</h1>
          <p className="text-gray-600">
            Edit <code className="bg-gray-200 px-1 rounded">src/App.jsx</code> and save to test HMR
          </p>
        </div>

        <button
          onClick={() => setCount(count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Count is {count}
        </button>
      </section>

      {/* LINKS */}
      <section className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">

        {/* Docs */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Documentation</h2>
          <p className="text-gray-500 mb-4">Your questions, answered</p>

          <ul className="space-y-2">
            <li>
              <a
                href="https://vite.dev/"
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <img className="w-5" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a
                href="https://react.dev/"
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <img className="w-5" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Connect</h2>
          <p className="text-gray-500 mb-4">Join the community</p>

          <ul className="space-y-2">
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank" className="text-blue-600 hover:underline">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank" className="text-blue-600 hover:underline">
                Discord
              </a>
            </li>
          </ul>
        </div>

      </section>

    </div>
  )
}

export default App
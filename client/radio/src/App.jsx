import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [data, setMessage] = useState() //value inside is the initial varaible, or empty in this case

  async function testApi() {
    try {
      const msg = await fetch("http://localhost:3000/api/test");
      if (!msg.ok) {
        throw new Error('Response Status: ${msg.status}');
      }
      else {
        const data = await msg.json();
        console.log(data);
        setMessage(data);
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      {data && data}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => testApi()}>test api!!</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

"use client"
import { useState, useEffect } from 'react'

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [memoInput, setMemoInput] = useState('')

  // Subject to change
  useEffect(() => {
    // Every 5 seconds, fetch a random memo from the API
    setTimeout(() => {
      const randomMemo = fetch('/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json())
      console.log(randomMemo)
    }, 5000)
  }, [formSubmitted])

  // On submit, post the memo to the API
  const handleMemoSubmit = (e: any) => {
    console.log('memo submitted')
    e.preventDefault()
    const body = {
      id: 1, // Subject to change, maybe use uuid or make it autoincrement
      time: new Date().toISOString(),
      memo: memoInput
    }
    console.log("submitted body: ", body)
    fetch(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(response => response.json())   // or .json() if the server is sending JSON
    .then(text => console.log(text))
    .catch(err => console.error('Error:', err));
    setFormSubmitted(true)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {
        formSubmitted
        ?
          <p>Form submitted</p>
        :
          <>
            <h1 className="text-4xl font-bold text-center">Welcome to your memopool</h1>
            <p className="text-2xl text-center">This is a place where you can share your thoughts with the world</p>
            <form onSubmit={handleMemoSubmit} className="flex flex-col items-center justify-center">
              <input className="border-2 border-black rounded-md p-2" type="text" placeholder="Enter your memo here" value={memoInput} onInput={(e: any) => setMemoInput(e.target.value)} />
              <button className="border-2 border-black rounded-md p-2 mt-2" type="submit">Submit</button>
            </form>
          </>
      }
    </main>
  )
}

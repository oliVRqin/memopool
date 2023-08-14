"use client"
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [memoInput, setMemoInput] = useState('')
  const [fetchedMemoContent, setFetchedMemoContent] = useState('')

  // Subject to change
  useEffect(() => {
    if (!formSubmitted) return;
    setInterval(() => {
      fetch(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/random`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json() // This returns a promise
      })
      .then(data => {
        setFetchedMemoContent(data.memo)
      })
      .catch(err => console.error('Error:', err));
    }, 5000)
  }, [formSubmitted])

  // On submit, post the memo to the API
  const handleMemoSubmit = (e: any) => {
    console.log('memo submitted')
    e.preventDefault()
    const body = {
      id: uuidv4(),
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
          <p className='text-2xl'>{fetchedMemoContent}</p>
        :
          <>
            <h1 className="text-4xl font-bold text-center">Welcome to your memopool</h1>
            <p className="text-2xl text-center">This is a place where you can share your thoughts with the world</p>
            <form onSubmit={handleMemoSubmit} className="flex flex-col items-center justify-center">
              <input className="border-2 border-black rounded-md p-2" type="text" placeholder="Enter your memo here" value={memoInput} onInput={(e: any) => setMemoInput((e.target as HTMLInputElement).value)} />
              <button className="border-2 border-black rounded-md p-2 mt-2" type="submit">Submit</button>
            </form>
          </>
      }
    </main>
  )
}

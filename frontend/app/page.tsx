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
    <main className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24">
      {
        formSubmitted
        ?
          <div className='flex flex-col justify-center items-center space-y-10 w-full'>
            <p className='text-2xl'>{fetchedMemoContent}</p>
          </div>
        :
          <div className='flex flex-col justify-center items-center space-y-10 w-full'>
            <h1 className="text-4xl font-bold text-center">MemoPool</h1>
            <form onSubmit={handleMemoSubmit} className="flex flex-col justify-center w-full items-center">
              <input 
                className="font-mono border-2 border-[#f5f5dc] bg-black text-[#f5f5dc] rounded-md py-5 pl-4 w-full sm:w-full md:w-3/5 lg:w-2/5" 
                type="text" 
                placeholder="What's on your mind?" 
                value={memoInput} 
                onInput={(e) => setMemoInput((e.target as HTMLInputElement).value)} 
              />
              <button className="bg-green-600 rounded-md p-3 mt-5 hover:opacity-80 text-[#f5f5dc]" type="submit">Submit</button>
            </form>
          </div>
      }
    </main>
  )
}

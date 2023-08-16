"use client"
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import LineChart from './components/LineChart';
import { MemoType } from './types/MemoType';
import DotPlot from './components/DotPlot';

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false)
  const [memoInput, setMemoInput] = useState<string>('')
  const [fetchedMemoDate, setFetchedMemoDate] = useState<string>('')
  const [fetchedMemoContent, setFetchedMemoContent] = useState<string>('')
  const [fetchedMemos, setFetchedMemos] = useState<MemoType[]>([]);
  const [seeMemosWithoutSubmitting, setSeeMemosWithoutSubmitting] = useState<boolean>(false);
  const [sentimentAnalysisErrorMessage, setSentimentAnalysisErrorMessage] = useState<string>('')
  const lastMessageIdRef = useRef('');

  // Subject to change
  useEffect(() => {
    if (!formSubmitted) return;

    let words = memoInput.split(" ");
    let numberOfWords = words.length;
    let intervalTime = 5000 + (Math.floor(numberOfWords / 5) * 1000);

    // Display the message you just posted first
    setFetchedMemoContent(memoInput);
    setFetchedMemoDate(new Date().toISOString());
    const fetchMemo = () => {
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
        return res.json();
      })
      .then(data => {
        let words = data.memo.split(" ");
        let numberOfWords = words.length;
      
        // Check if the current message's ID matches the last message's ID
        if (data.id === lastMessageIdRef.current) {
          intervalTime = 1000; // If it does, fetch again in 1 second
        } else {
          intervalTime = 4000 + (Math.floor(numberOfWords / 5) * 1000);
        }
      
        setFetchedMemoContent(data.memo);
        setFetchedMemoDate(data.time);
        lastMessageIdRef.current = data.id;
        setTimeout(fetchMemo, intervalTime);
      })
      .catch(err => console.error('Error:', err));
    }
    setTimeout(fetchMemo, intervalTime);
  }, [formSubmitted, memoInput])

  const handleSeeMemos = () => {
    setSeeMemosWithoutSubmitting(true);
    // GET request for all memos
    fetch(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/all-memos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    }
    )
    .then(data => {
      console.log(data);
      setFetchedMemos(data);
    }
    )
    .catch(err => console.error('Error:', err));
  }

  const handleDontSeeMemos = () => {
    setSeeMemosWithoutSubmitting(false);
  }

  const handleMemoSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    if (memoInput.length === 0) return;
    const body = {
      id: uuidv4(),
      time: new Date().toISOString(),
      memo: memoInput
    }
    fetch(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/analyze-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(res => {
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("Bad request: Invalid memo. Please try again! (Note: Shorter, misspelled, or nonsensical memos usually lack context, and thus, are harder to analyze.)");
        } else if (res.status == 406) {
          throw new Error("Bad request: Invalid memo. Memo cannot started with a number.");
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      }
      return res.json()
    }).then(data => {
      console.log(data)
      setFormSubmitted(true)
    })
    .catch(err => {
      setSentimentAnalysisErrorMessage(err.message)
    });
  }

  // Converts the date string to a more readable format
  function formatDateWithTime(dateString: string) {
    var date = new Date(dateString);

    var year = date.getFullYear();
    var month = date.toLocaleString('default', { month: 'long' });
    var day = date.getDate();

    var hour = date.getHours();
    var period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; 

    var minutes = date.getMinutes().toString();
    minutes = parseInt(minutes) < 10 ? '0' + minutes.toString() : minutes.toString();

    var formattedTime = month + ' ' + day + ', ' + year + ' — ' + hour + ':' + minutes + ' ' + period;

    return formattedTime;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24">
      {
        formSubmitted
        ?
          <div className='flex flex-col justify-center items-center space-y-10 w-full'>
            <p className='text-2xl'>{fetchedMemoContent}</p>
            <p className='text-lg text-green-400'>{fetchedMemoDate ? formatDateWithTime(fetchedMemoDate) : ''}</p>
          </div>
        :
          seeMemosWithoutSubmitting
          ?
            <div className='flex flex-col justify-center items-center space-y-10 w-full'>
              <p className='text-3xl underline'>Memos</p>
              <ul className='flex flex-col justify-center items-center space-y-10 w-full'>
                {fetchedMemos && fetchedMemos.map((memo: MemoType) => (
                  <li key={memo.id} className='flex flex-col justify-center items-center space-y-5 p-3 rounded-lg border-2'>
                    <p className='text-lg'>{memo.memo}</p>
                    <p className='text-md text-green-400'>{memo.time ? formatDateWithTime(memo.time) : ''}</p>
                    {/* <p className='text-md text-green-400'>Positivity Score: {memo.positivityScore}</p> */}
                  </li>
                ))}
              </ul>
              {
                fetchedMemos && fetchedMemos.length > 0
                ?
                  <>
                    <LineChart data={fetchedMemos} />
                    <DotPlot data={fetchedMemos} />
                  </>
                :
                null
              }
              <button onClick={handleDontSeeMemos} className='text-gray-500 p-3 font-mono rounded-lg hover:opacity-80'>
                Return to form {'>'}{'>'}{'>'}
              </button>
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
              <p className='text-red-400'>{sentimentAnalysisErrorMessage}</p>
              <button className="bg-green-600 rounded-md p-3 mt-5 hover:opacity-80 text-[#f5f5dc]" type="submit">Submit</button>
            </form>
            <button onClick={handleSeeMemos} className='text-gray-500 text-sm p-3 underline font-mono rounded-lg hover:opacity-80'>
              See my MemoPool
            </button>
          </div>
      }
    </main>
  )
}

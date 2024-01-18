"use client"
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'

type Memo = {
  id: string,
  time: string,
  memo: string,
  sentimentScore: string,
  positivityScore: string
}

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false)
  const [memoInput, setMemoInput] = useState<string>('')
  const [submittedMemoContent, setSubmittedMemoContent] = useState<any>();
  const [fetchedMemos, setFetchedMemos] = useState([]); 
  const [seeMemosWithoutSubmitting, setSeeMemosWithoutSubmitting] = useState<boolean>(false);
  const [sentimentAnalysisErrorMessage, setSentimentAnalysisErrorMessage] = useState<string>('')
  const [similarSentimentMemos, setSimilarSentimentMemos] = useState([])
  const [seeSimilarMemosButtonClicked, setSeeSimilarMemosButtonClicked] = useState<boolean>(false);
  const [selectedMemoId, setSelectedMemoId] = useState<string>('');

  const seeSimilarSentimentMemos = (memo: Memo) => {
    fetch(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/find-memos-with-similar-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memo),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    }).then(data => {
      setSimilarSentimentMemos(data);
    })
    .catch(err => console.error('Error:', err));
  } 

  const handleSeeSimilarMemos = (memo: Memo, id: string) => {
    setSelectedMemoId(id);
    setSeeSimilarMemosButtonClicked(true)
    seeSimilarSentimentMemos(memo)
  }

  useEffect(() => {
    if (!formSubmitted) return;
    seeSimilarSentimentMemos(submittedMemoContent)
  }, [formSubmitted, submittedMemoContent])

  const handleSeeMemos = () => {
    setFormSubmitted(false);
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
      setFetchedMemos(data);
    }
    )
    .catch(err => console.error('Error:', err));
  }

  const handleDontSeeMemos = () => {
    setFormSubmitted(false);
    setSeeMemosWithoutSubmitting(false);
    setSeeSimilarMemosButtonClicked(false);
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
      setSubmittedMemoContent(data)
      setFormSubmitted(true)
      setMemoInput('')
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

  // TODO: Add flow for initial state where there are no memos with similar sentiment (usually cause there's not enough memos)
  // TODO: Room for refactoring certain areas of repeat code (jsx especially)

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24">
      {
        formSubmitted
        ?
          <div className="flex flex-col justify-between space-y-10">
            <div className='flex flex-col justify-center items-center space-y-5 w-full pb-10'>
              <p className='text-2xl'>{submittedMemoContent.memo}</p>
              <p className='text-lg text-green-400'>{submittedMemoContent ? formatDateWithTime(submittedMemoContent.time) : ''}</p>
              <p className='text-md text-blue-400'>Positivity Score: {submittedMemoContent.positivityScore}</p>
            </div>
            {/* If more than a few memos */}
            <div className='flex flex-col justify-center items-center'>
              <p className='text-2xl font-bold text-center pb-10'>Memos with similar sentiment</p>
              <div className='grid grid-cols-2 gap-4 justify-center mx-auto max-w-4xl'>
                {
                  similarSentimentMemos && similarSentimentMemos.map(
                    (memoObj: any) => {
                      return (
                        <div key={memoObj.id} className='flex flex-col space-y-5 justify-center items-center border-2 rounded-lg p-5'>
                          <p className='text-2xl'>{memoObj.memo}</p>
                          <p className='text-lg text-green-400'>{memoObj.time ? formatDateWithTime(memoObj.time) : ''}</p>
                          <p className='text-md text-blue-400'>Positivity Score: {memoObj.positivityScore}</p>
                        </div>
                      )
                    }
                  )
                }
              </div>
            </div>
            <button onClick={handleSeeMemos} className='text-gray-500 text-sm p-3 underline font-mono rounded-lg hover:opacity-80'>
              See my MemoPool
            </button>
            <button onClick={handleDontSeeMemos} className='text-gray-500 underline font-mono rounded-lg hover:opacity-80'>
                Return to form
                </button>
          </div>
        :
          seeMemosWithoutSubmitting
          ?
            <div className='flex flex-col justify-center items-center space-y-10 w-full'>
              {!seeSimilarMemosButtonClicked && <p className='text-3xl underline'>Memos</p>}
              <ul className={`flex flex-col justify-center items-center space-y-10 ${seeSimilarMemosButtonClicked ? `w-full` : `w-1/3`}`}>
                {[...fetchedMemos].reverse().map((memo: Memo) => (
                  seeSimilarMemosButtonClicked && selectedMemoId === memo.id 
                  ? 
                    <li key={memo.id} className='flex flex-col justify-center items-center space-y-5 p-3'>
                      <p className='text-2xl'>{memo.memo}</p>
                      <p className='text-lg text-green-400'>{memo.time ? formatDateWithTime(memo.time) : ''}</p>
                      <p className='text-md text-blue-400'>Positivity Score: {memo.positivityScore}</p>
                      {!seeSimilarMemosButtonClicked && <button onClick={() => handleSeeSimilarMemos(memo, memo.id)} className='text-gray-500 p-3 font-mono rounded-lg hover:opacity-80'>
                        See Similar Memos {'>'}{'>'}{'>'}
                      </button>}
                      {seeSimilarMemosButtonClicked && selectedMemoId === memo.id && (
                        <div className='flex flex-col justify-center items-center'>
                          <p className='text-2xl font-bold text-center py-10'>Memos with similar sentiment</p>
                          <div className='grid grid-cols-2 gap-4 justify-center mx-auto max-w-4xl'>
                            {
                              similarSentimentMemos && similarSentimentMemos.map(
                                (memoObj: any) => {
                                  return (
                                    <div key={memoObj.id} className='flex flex-col space-y-5 justify-center items-center border-2 rounded-lg p-5'>
                                      <p className='text-2xl'>{memoObj.memo}</p>
                                      <p className='text-lg text-green-400'>{memoObj.time ? formatDateWithTime(memoObj.time) : ''}</p>
                                      <p className='text-md text-blue-400'>Positivity Score: {memoObj.positivityScore}</p>
                                    </div>
                                  )
                                }
                              )
                            }
                          </div>
                          <button onClick={() => setSeeSimilarMemosButtonClicked(false)} className='text-gray-500 p-3 font-mono rounded-lg hover:opacity-80 pt-10'>
                          {'<'}{'<'}{'<'} Back to memos 
                          </button>
                        </div>
                      )}
                    </li>
                  :
                    !seeSimilarMemosButtonClicked && (
                      <li key={memo.id} className='flex flex-col justify-center items-center space-y-5 p-5 rounded-lg w-full border-2'>
                        <p className='text-2xl justify-center text-center'>{memo.memo}</p>
                        <p className='text-md text-green-400'>{memo.time ? formatDateWithTime(memo.time) : ''}</p>
                        <p className='text-md text-blue-400'>Positivity Score: {memo.positivityScore}</p>
                        {!seeSimilarMemosButtonClicked && <button onClick={() => handleSeeSimilarMemos(memo, memo.id)} className='text-gray-500 text-sm font-mono rounded-lg hover:opacity-80'>
                          See Similar Memos {'>'}{'>'}{'>'}
                        </button>}
                      </li>
                    )
                ))}
                <button onClick={handleDontSeeMemos} className='text-gray-500 underline font-mono rounded-lg hover:opacity-80'>
                Return to form
                </button>
              </ul>
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
            <div className="flex flex-col justify-center items-center w-full">
              <div className="flex justify-center items-center w-full sm:w-full md:w-3/5 lg:w-2/5 pb-5">
                <Image className="brightness-150" src="/info-icon.svg" alt="Info" height={25} width={25} />
                <h1 className="text-lg text-[#655a5a] brightness-200 font-semibold text-center pl-3">How does MemoPool work?</h1>
              </div>
              <div className="flex flex-col space-y-5 justify-center items-center w-full sm:w-full md:w-3/5 lg:w-2/5">
                <p className="pl-10 text-[#655a5a] brightness-125">We aim to draw connections between your past thoughts and current thoughts to spark new insights, rekindle old memories, and learn more about yourself — all while we collect ZERO information about identity.</p>
                <p className="pl-10 text-[#655a5a] brightness-125">Your memos are completely untraceable and unidentifiable; however, you have the option to share them with others. Learn more about the design of MemoPool, how to use it, and even posting in the <span className="brightness-150 font-bold">public</span> MemoPool <span className="underline"><a href="/info">here</a></span>.</p>
              </div>
            </div>
            
          </div>
      }
    </main>
  )
}

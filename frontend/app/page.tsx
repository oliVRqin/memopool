"use client"
import { useState, useEffect } from 'react'
import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'
import SimilarMemos from '@/components/SimilarMemos';
import MemoBox from '@/components/MemoBox';
import { Memo } from '@/types/memo';
import { CheckedStates } from '@/types/checkedStates';
import { seeSimilarSentimentMemos } from '@/functions/seeSimilarSentimentMemos';

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false)
  const [memoInput, setMemoInput] = useState<string>('')
  const [userIdInput, setUserIdInput] = useState<string>('')
  const [keyId, setKeyId] = useState<string>('');
  const [userId, setUserId] = useState<string | null>();
  const [openSubmitUserIdForm, setOpenSubmitUserIdForm] = useState<boolean>(false)
  const [submittedMemoContent, setSubmittedMemoContent] = useState<any>();
  const [fetchedMemos, setFetchedMemos] = useState([]); 
  const [seeMemosWithoutSubmitting, setSeeMemosWithoutSubmitting] = useState<boolean>(false);
  const [sentimentAnalysisErrorMessage, setSentimentAnalysisErrorMessage] = useState<string>('')
  const [similarSentimentMemos, setSimilarSentimentMemos] = useState([])
  const [seeSimilarMemosButtonClicked, setSeeSimilarMemosButtonClicked] = useState<boolean>(false);
  const [selectedMemoId, setSelectedMemoId] = useState<string>('');
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [isOpenGeneratedKeyModal, setIsOpenGeneratedKeyModal] = useState<boolean>(false);
  // Checks if the sessionId has changed; if so, we will need to ask user to input their key id to retrieve memos + post to their own memopool
  const [isSameSessionId, setIsSameSessionId] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState<string>('');
  const [checkedStates, setCheckedStates] = useState<CheckedStates>({});

  // Fetches userId and keyId if "signed in"
  useEffect(() => {
    if (!isSameSessionId) return;
    const fetchKeyId = async () => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-keyId`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }).then(data => {
        setKeyId(data.keyId);
      });
    }
    const fetchUserId = async () => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-userId`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }).then(data => {
        setUserId(data.userId);
      });
    }
    fetchKeyId()
    fetchUserId()
  }, [isSameSessionId])

  useEffect(() => {
    const fetchIfSessionExistsInStore = async () => {
      const result = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/does-session-id-exist-in-keysession-store`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }).then(data => {
        setIsSameSessionId(data.keySessionExists);
      });
    }

    fetchIfSessionExistsInStore()
      .catch(err => console.error('Error in fetchIfSessionExistsInStore:', err));
  }, [])

  useEffect(() => {
    if (!formSubmitted) return;
    const findSimilarSentimentMemosAfterSubmit = async (memo: Memo) => {
      try {
        const similarMemos = await seeSimilarSentimentMemos(memo);
        setSimilarSentimentMemos(similarMemos);
      } catch (err) {
          console.error('Error in handleSeeSimilarMemos:', err);
      }
    }
    findSimilarSentimentMemosAfterSubmit(submittedMemoContent);
  }, [formSubmitted, submittedMemoContent])

  const handleSeeSimilarMemos = async (memo: Memo, id: string) => {
    setSelectedMemoId(id);
    setSeeSimilarMemosButtonClicked(true)
    try {
      const similarMemos = await seeSimilarSentimentMemos(memo);
      setSimilarSentimentMemos(similarMemos);
    } catch (err) {
        console.error('Error in handleSeeSimilarMemos:', err);
    }
  }

  const handleSeeMemos = () => {
    setFormSubmitted(false);
    setSeeMemosWithoutSubmitting(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/my-memos`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    }).then(data => {
      setFetchedMemos(data);
      const newCheckedStates: CheckedStates = {};
      data.forEach((memo: Memo) => {
        newCheckedStates[memo.id] = memo.visibility === 'public';
      });
      setCheckedStates(newCheckedStates);
    }).catch(err => console.error('Error in handleSeeMemos:', err));
  }

  const handleDontSeeMemos = () => {
    setFormSubmitted(false);
    setSeeMemosWithoutSubmitting(false);
    setSeeSimilarMemosButtonClicked(false);
  }

  const handleChangeVisibility = (memoId: string, isChecked: boolean) => {
    setCheckedStates(prevState => ({
      ...prevState,
      [memoId]: isChecked,
    }));
  
    const newVisibility = isChecked ? "public" : "private";
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/change-memo-visibility`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memoId, newVisibilitySetting: newVisibility }),
    })
    .then(response => {
      if (!response.ok) {
        // If the server update fails, rollback the UI change
        setCheckedStates(prevState => ({
          ...prevState,
          [memoId]: !isChecked,
        }));
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    })
    .catch(error => console.error('Error in handleChangeVisibility:', error));
  };
  
  const handleKeySubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    if (keyInput.length === 0) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/retrieve-session`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyId: keyInput }),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json()
    }).then(() => {
      setIsSameSessionId(true)
    }).catch((err) => {
      console.error('Error on handleKeySubmit:', err)
    });
  }

  const handleSetUserId = () => {
    const body = {
      userId: userIdInput
    }
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/change-userId`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json()
    }).then(() => {
      // add some other things after user id submitted
      setUserIdInput('')
      setOpenSubmitUserIdForm(false)
    })
    .catch(err => {
      console.log("Error on handleSetUserId: ", err)
    });
  }

  const handleGenerateKey = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-key`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Response not ok');
      }
      const data = await response.json();
      setGeneratedKey(data.keyId);
      setIsOpenGeneratedKeyModal(true);
    } catch (error) {
      console.error('Error on handleGenerateKey:', error);
    }
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedMessage('Copied!');
    }, (err) => {
      console.error('Could not copyToClipboard: ', err);
    });
  }

  const handleMemoSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    if (memoInput.length === 0) return;
    const body = {
      id: uuidv4(),
      time: new Date().toISOString(),
      memo: memoInput
    }
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze-sentiment`, {
      method: 'POST',
      credentials: 'include',
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

  return (
    <>
      <Head>
        <link rel="icon" href="/logo.svg" sizes="any" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24">
        {
          formSubmitted
          ?
            <div className="flex flex-col justify-between space-y-10">
              <div className='flex flex-col justify-center items-center space-y-5 w-full pb-10'>
                <MemoBox memo={submittedMemoContent} isSelected={formSubmitted} />
              </div>
              <div className='flex flex-col justify-center items-center'>
                {similarSentimentMemos.length > 0 && <SimilarMemos similarSentimentMemos={similarSentimentMemos} />}
              </div>
              <button onClick={handleSeeMemos} className='text-gray-500 mt-10 text-sm p-3 underline font-mono rounded-lg hover:opacity-80'>
                See my MemoPool
              </button>
              <button onClick={handleDontSeeMemos} className='text-gray-500 underline font-mono rounded-lg hover:opacity-80'>
                Return to form
              </button>
            </div>
          :
            seeMemosWithoutSubmitting
            ?
              <div className='flex flex-col justify-center items-center w-full'>
                <div className={`flex flex-col justify-center items-center space-y-10 ${seeSimilarMemosButtonClicked ? `w-full` : `w-1/3`}`}>
                {!seeSimilarMemosButtonClicked && (
                  <>
                    <p className='text-3xl underline'>Profile</p>
                    <div className='flex flex-col'>
                      <p className='text-xl text-green-600'>
                        <span className='text-green-300'>Key ID</span>: {keyId}
                      </p>
                      <p className='flex text-xl text-green-600 justify-between'>
                        <p>
                          <span className='text-green-300'>User ID</span>: {userId ? userId : 'Not Set'} 
                        </p>
                        <span>
                          <button onClick={() => setOpenSubmitUserIdForm(true)} className="text-gray-500 pl-2 text-sm underline font-mono rounded-lg hover:opacity-80">
                            {userId ?  "Change User ID?" : "Don't have a user Id?"}
                          </button>
                        </span>
                      </p>
                      {openSubmitUserIdForm && (
                        <form onSubmit={handleSetUserId} className="flex flex-col mt-10 justify-center w-full items-center">
                          <input 
                            className="font-mono border-2 border-[#f5f5dc] bg-black text-[#f5f5dc] rounded-md py-5 pl-4 w-full sm:w-full md:w-3/5 lg:w-2/5" 
                            type="text" 
                            placeholder="Set User ID" 
                            value={userIdInput} 
                            onInput={(e) => setUserIdInput((e.target as HTMLInputElement).value)} 
                          />
                          <button className="bg-green-600 rounded-md p-3 mt-5 hover:opacity-80 text-[#f5f5dc]" type="submit">Submit</button>
                        </form>
                      )}
                    </div>
                  </>
                )}
                </div>
                {!seeSimilarMemosButtonClicked && <p className='text-3xl underline mt-20 mb-10'>Memos</p>}
                <ul className={`flex flex-wrap justify-center mb-10 items-stretch gap-4 ${seeSimilarMemosButtonClicked ? `w-full` : `w-2/3`}`}>
                  {
                    fetchedMemos.length === 0 && (
                      <p className="text-lg font-mono">
                        No memos found!
                      </p>
                    )
                  }
                  {[...fetchedMemos].reverse().map((memo: Memo) => (
                    seeSimilarMemosButtonClicked && selectedMemoId === memo.id 
                    ? 
                      <li key={memo.id} className='flex flex-col justify-between items-center space-y-5 p-3 w-[calc(50%-1rem)] min-h-[250px]'>
                        <MemoBox memo={memo} isSelected={seeSimilarMemosButtonClicked} />
                        {!seeSimilarMemosButtonClicked && <button onClick={() => handleSeeSimilarMemos(memo, memo.id)} className='text-gray-500 p-3 font-mono rounded-lg hover:opacity-80'>
                          See Similar Memos {'>'}{'>'}{'>'}
                        </button>}
                        {seeSimilarMemosButtonClicked && selectedMemoId === memo.id && (
                          <div className='flex flex-col justify-center items-center'>
                            <SimilarMemos similarSentimentMemos={similarSentimentMemos} includeUserId={false} />
                            <button onClick={() => setSeeSimilarMemosButtonClicked(false)} className='text-gray-500 pt-10 font-mono rounded-lg hover:opacity-80 pt-10'>
                            {'<'}{'<'}{'<'} Back to memos 
                            </button>
                          </div>
                        )}
                      </li>
                    :
                      !seeSimilarMemosButtonClicked && (
                        <li key={memo.id} className='flex flex-col justify-between items-center space-y-5 p-5 rounded-lg w-[calc(50%-1rem)] min-h-[250px] border-2'>
                          <MemoBox memo={memo} isSelected={false} />
                          <div className="flex items-center justify-center space-x-4">
                            <p>Private</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={checkedStates[memo.id]} // Reflects the memo's visibility state, filtered by memo id
                                onChange={(e) => handleChangeVisibility(memo.id, e.target.checked)} // Updates visibility on change
                              />
                              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                            </label>
                            <p>Public</p>
                          </div>
                          <button onClick={() => handleSeeSimilarMemos(memo, memo.id)} className='text-gray-500 text-sm font-mono rounded-lg hover:opacity-80'>
                            See Similar Memos {'>'}{'>'}{'>'}
                          </button>
                        </li>
                      )
                  ))}
                </ul>
                <button onClick={handleDontSeeMemos} className='text-gray-500 underline font-mono hover:opacity-80'>
                  Return to form
                </button>
              </div>
            :
            <div className='flex flex-col justify-center items-center w-full'>
              <h1 className="text-4xl font-bold text-center">MemoPool</h1>
              <h2 className="text-md brightness-50 font-mono text-center mt-3">An anonymous, intelligent, personal memo app.</h2>
              {
                isSameSessionId
                ?
                  <>
                    <form onSubmit={handleMemoSubmit} className="flex flex-col mt-10 justify-center w-full items-center">
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
                    <button onClick={handleSeeMemos} className='text-gray-500 mt-8 text-sm p-3 underline font-mono rounded-lg hover:opacity-80'>
                      See my MemoPool
                    </button>
                    <a href="/public" className='text-gray-500 mt-8 text-sm p-3 underline font-mono rounded-lg hover:opacity-80'>
                      See Public MemoPool
                    </a>
                  </>
                :
                  <>
                    <form onSubmit={handleKeySubmit} className="flex flex-col mt-10 justify-center w-full items-center">
                        <input 
                            className="font-mono border-2 border-[#f5f5dc] bg-black text-[#f5f5dc] rounded-md py-5 pl-4 w-full sm:w-full md:w-3/5 lg:w-2/5" 
                            type="text" 
                            placeholder="Enter Key ID 🔑" 
                            value={keyInput} 
                            onInput={(e) => setKeyInput((e.target as HTMLInputElement).value)} 
                        />
                        <button className="bg-transparent border-2 opacity-80 rounded-md px-3 py-2 mt-5 hover:opacity-60 text-[#f5f5dc]" type="submit">Submit</button>
                    </form>
                    <p className="text-gray-500 mt-10">
                      Don&apos;t have a key?
                      <span>
                        <button onClick={handleGenerateKey} className='text-gray-500 pl-2 text-sm underline font-mono rounded-lg hover:opacity-80'>
                          Generate Key
                        </button>
                      </span>
                    </p>
                    {isOpenGeneratedKeyModal && (
                        <div className="flex flex-col justify-center items-center border-2 rounded-lg p-5 mt-10">
                            <p className='text-gray-500 brightness-150 text-md font-mono rounded-lg'>
                              Your Key ID: <span className="brightness-200">{generatedKey}</span>
                            </p>
                            <div className='p-3 mt-3 bg-blue-600 cursor-pointer flex flex-row items-center hover:opacity-90 border-2 rounded-lg'>
                              <button onClick={() => copyToClipboard(generatedKey)}>Copy to Clipboard</button>
                            </div>   
                            { copiedMessage && <p className="pt-2">{copiedMessage}</p>}
                        </div>
                    )}
                  </>
              }
              <div className="flex flex-col justify-center items-center w-full mt-8">
                <div className="flex justify-center items-center w-full sm:w-full md:w-3/5 lg:w-2/5 pb-5">
                  <Image className="brightness-150" src="/info-icon.svg" alt="Info" height={25} width={25} />
                  <h1 className="text-lg text-[#655a5a] brightness-200 font-semibold text-center pl-3">What is MemoPool?</h1>
                </div>
                <div className="flex flex-col space-y-5 justify-center items-center w-full sm:w-full md:w-3/5 lg:w-2/5">
                <p className="pl-10 text-[#655a5a] brightness-125">Think Apple Notes but with the optionality to post memos privately or publicly, plus GPT-4 
                  capabilities for analyzing each memo to better provide personal insights.</p>
                  <p className="pl-10 text-[#655a5a] brightness-125">MemoPool seeks to let users draw connections between past and current thoughts to learn more about themselves — all while collecting <span className="underline">ZERO</span> information about user identity.</p>
                  <p className="pl-10 text-[#655a5a] brightness-125">Your memos are completely untraceable and unidentifiable; however, you have the option to publicize them in the <span className="brightness-150 font-bold">public</span> MemoPool. Learn more about MemoPool <span className="underline"><a href="/info">here</a></span>.</p>
                </div>
              </div>
            </div>
        }
      </main>
    </>
  )
}

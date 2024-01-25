"use client"
import { useState, useEffect } from "react"
import { Memo } from "@/types/memo";
import MemoBox from "@/components/MemoBox";
import SimilarMemos from "@/components/SimilarMemos";

const Public = () => {
    const [memos, setMemos] = useState([]);
    const [similarSentimentMemos, setSimilarSentimentMemos] = useState([])

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/see-public-memos`, {
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
            setMemos(data)
        }).catch(err => console.error('Error in handleSeePublicMemos:', err));
    }, [])

    useEffect(() => {
        const seeSimilarSentimentMemos = (memo: Memo) => {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/find-memos-with-similar-sentiment`, {
              method: 'POST',
              credentials: 'include',
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
            .catch(err => console.error('Error in seeSimilarSentimentMemos:', err));
          } 
    }, [])

    return (
        <div className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24 brightness-75">
            <div className='flex flex-col justify-center items-center space-y-10 w-full'>
                <p className='text-3xl underline'>Public Memos</p>
                <ul className={`flex flex-col justify-center mb-10 items-center space-y-10 w-1/3`}>
                    {
                        memos.length === 0 
                        ? 
                            <p className="text-lg font-mono">
                                No memos found!
                            </p>
                        :
                        [...memos].reverse().map((memo: Memo) => {
                            return (
                                <>
                                    <li key={memo.id} className='flex flex-col justify-center items-center space-y-5 p-3 border-2 rounded-lg'>
                                        <MemoBox memo={memo} />
                                    </li>
                                    {/* <div className='flex flex-col justify-center items-center'>
                                        <SimilarMemos similarSentimentMemos={similarSentimentMemos} />
                                    </div> */}
                                </>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    )
}

export default Public;
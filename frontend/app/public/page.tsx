"use client"
import { useState, useEffect } from "react"
import { Memo } from "@/types/memo";
import MemoBox from "@/components/MemoBox";
import SimilarMemos from "@/components/SimilarMemos";
import { seeSimilarSentimentMemos } from "@/functions/seeSimilarSentimentMemos";
import { seePublicMemos } from "@/functions/seePublicMemos";

const Public = () => {
    const [memos, setMemos] = useState([]);
    const [similarSentimentMemos, setSimilarSentimentMemos] = useState([])
    const [seeSimilarMemosButtonClicked, setSeeSimilarMemosButtonClicked] = useState<boolean>(false);
    const [selectedMemoId, setSelectedMemoId] = useState<string>('');

    useEffect(() => {
        const fetchPublicMemos = async () => {
            try {
                const publicMemos = await seePublicMemos();
                setMemos(publicMemos);
            } catch (err) {
                console.error('Error in handleSeeSimilarMemos:', err);
            }
        }
        fetchPublicMemos()
    }, [])

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

    return (
        <div className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24 brightness-75">
            <div className={`flex flex-col justify-center items-center space-y-10 ${seeSimilarMemosButtonClicked ? `w-full` : `w-1/3`}`}>
                <p className='text-3xl underline'>Public Memos</p>
                <ul className={`flex flex-col justify-center mb-10 items-center space-y-10`}>
                    {
                        memos.length === 0 && (
                        <p className="text-lg font-mono">
                            No memos found!
                        </p>
                        )
                    }
                    {
                        [...memos].reverse().map((memo: Memo) => (
                            seeSimilarMemosButtonClicked && selectedMemoId === memo.id 
                            ? 
                                <li key={memo.id} className='flex flex-col justify-center items-center space-y-5 p-3'>
                                    <MemoBox memo={memo} />
                                    <p className='text-md text-blue-400'>User ID: {memo.userId ? memo.userId : 'Not Set'}</p>
                                    {!seeSimilarMemosButtonClicked && <button onClick={() => handleSeeSimilarMemos(memo, memo.id)} className='text-gray-500 p-3 font-mono rounded-lg hover:opacity-80'>
                                    See Similar Memos {'>'}{'>'}{'>'}
                                    </button>}
                                    {seeSimilarMemosButtonClicked && selectedMemoId === memo.id && (
                                    <div className='flex flex-col justify-center items-center'>
                                        <SimilarMemos similarSentimentMemos={similarSentimentMemos} />
                                        <button onClick={() => setSeeSimilarMemosButtonClicked(false)} className='text-gray-500 pt-10 font-mono rounded-lg hover:opacity-80 pt-10'>
                                        {'<'}{'<'}{'<'} Back to memos 
                                        </button>
                                    </div>
                                    )}
                                </li>
                            :
                                !seeSimilarMemosButtonClicked && (
                                    <li key={memo.id} className='flex flex-col justify-center items-center space-y-5 p-5 rounded-lg w-full border-2'>
                                    <MemoBox memo={memo} />
                                    <p className='text-md text-blue-400'>User ID: {memo.userId ? memo.userId : 'Not Set'}</p>
                                    <button onClick={() => handleSeeSimilarMemos(memo, memo.id)} className='text-gray-500 text-sm font-mono rounded-lg hover:opacity-80'>
                                        See Similar Memos {'>'}{'>'}{'>'}
                                    </button>
                                    </li>
                                )
                        )
                    )}
                </ul>
            </div>
            {
                !seeSimilarMemosButtonClicked && (
                    <a href="/" className='text-gray-500 pt-10 font-mono rounded-lg hover:opacity-80 pt-10'>
                        {'<'}{'<'}{'<'} Home 
                    </a>
                )
            }
        </div>
    )
}

export default Public;
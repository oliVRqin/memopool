"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'
import MemoBox from '@/components/MemoBox';
import Link from 'next/link';


const PublicUserIdPage = () => {
  const params = useParams();
  const id = params?.id
  console.log("id: ", id)
  const [memos, setMemos] = useState([]);

  const handleConnect = () => {
    alert("Coming soon!")
  }

  console.log("memos: ", memos)

  useEffect(() => {
    if (!id) return;
    const fetchMemos = async () => {
        const body = {
            userId: id
        }
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/view-specific-user`, {
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
            return res.json();
        }).then(data => {
            setMemos(data);
        });
    }
    fetchMemos();
  }, [id]); 

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24">
        <div className='flex flex-col justify-center items-center w-full'>
            <div className={`flex flex-col justify-center items-center space-y-10 w-full`}>
                <>
                    <div className='flex flex-col'>
                      <p className='flex text-3xl text-green-600 justify-between'>
                        <p>
                          {id} 
                        </p>
                      </p>
                    </div>
                    <button onClick={handleConnect} className='border-2 text-sm rounded-lg p-2'>
                        Connect as MemoBuddy!
                    </button>
                </>
            </div>
            <p className='text-3xl underline mt-20 mb-10'>Public Memos</p>
            <ul className={`flex flex-wrap justify-center mb-10 items-stretch gap-4 w-2/3`}>
                {
                    memos.length === 0 && (
                        <p className="text-lg font-mono">
                            No memos found!
                        </p>
                    )
                }
                {[...memos].reverse().map((memo: any) => (
                    <li key={memo.id} className='flex flex-col justify-between items-center space-y-5 p-5 rounded-lg w-[calc(50%-1rem)] min-h-[250px] border-2'>
                        <MemoBox memo={memo} isSelected={false} hasUserId={false} />
                    </li>
                ))}
            </ul>
            <Link href="/public" className='text-gray-500 pt-10 font-mono rounded-lg hover:opacity-80 pt-10'>
                {'<'}{'<'}{'<'} Back to Public Memos 
            </Link>
        </div>
    </main>
  );
}

export default PublicUserIdPage;

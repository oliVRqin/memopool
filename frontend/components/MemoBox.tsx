import { Memo } from "@/types/memo";
import { formatDateWithTime } from "@/functions/formatDateWithTime";
import Link from "next/link";

interface MemoBoxProps { 
    memo: Memo, 
    isSelected: boolean; 
    hasUserId: boolean;
}

const MemoBox = ({ memo, isSelected, hasUserId }: MemoBoxProps) => {
    return (
        <>
            <p className={`text-2xl ${isSelected ? '' : 'line-clamp-3'} overflow-hidden`}>{memo.memo}</p>
            <div className="flex flex-col justify-center items-center">
                <p className='text-lg text-green-400'>{memo.time ? formatDateWithTime(memo.time) : ''}</p>
                <p className='text-md text-green-400 p-3'>Positivity Score: {memo.positivityScore}</p>
            </div>
            {hasUserId && (
                memo.userId
                ?
                    <Link href={`/public/${memo.userId}`}>
                        <p className='text-2xl text-blue-400 cursor-pointer hover:opacity-90 font-bold'>User ID: {memo.userId}</p>
                    </Link>
                :
                    <p className='text-2xl text-blue-400 font-bold'>
                        User ID: Not Set
                    </p>
            )}
        </>
    )
}

export default MemoBox;

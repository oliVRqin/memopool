import { Memo } from "@/types/memo";
import { formatDateWithTime } from "@/functions/formatDateWithTime";

const MemoBox = ({ memo }: { memo: Memo }) => {
    return (
        <>
            <p className='text-2xl line-clamp-3 overflow-hidden'>{memo.memo}</p>
            <p className='text-lg text-green-400'>{memo.time ? formatDateWithTime(memo.time) : ''}</p>
            <p className='text-md text-blue-400'>Positivity Score: {memo.positivityScore}</p>
        </>
    )
}

export default MemoBox;

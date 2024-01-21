import { formatDateWithTime }  from '@/functions/formatDateWithTime'

const SimilarMemos = ({ similarSentimentMemos }: any) => {
    return (
        <>
            <p className='text-2xl font-bold underline text-center py-10'>Memos with similar sentiment</p>
            <div className={`grid ${similarSentimentMemos.length < 2 ? `grid-cols-1` : `grid-cols-2`} gap-4 justify-center mx-auto max-w-4xl`}>
                {similarSentimentMemos.length === 0 && (
                    <p className="flex text-center items-center p-5">There are no other memos. Write more memos to compare!</p>
                )}
                {
                    similarSentimentMemos.map(
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
        </>
    )
}

export default SimilarMemos;

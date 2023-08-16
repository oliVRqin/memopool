

type MemoType = {
    id: string,
    time: string,
    memo: string,
    sentimentScore: string,
    positivityScore: string
}

// The recommendation algorithm takes the data from a memo and returns a recommendation of the 
// k-nearest memos to it.
const kNearestMemos = (data: MemoType, k: number): Array<MemoType> => {
    const { id, time, memo, sentimentScore, positivityScore } = data;

    // Key question: How can we calculate similarity between two memos?

    // In the future, we could make this function even more generalizable by 
    // specifying the parameter in which things are nearest. For example,
    // we could specify that we want the k-nearest memos in terms of positivityScore
    // to the current memo

    // The k-nearest memos are the k memos with the smallest absolute difference
    function absoluteDifference(a: number, b: number): number {
        const difference = a - b;
        return Math.abs(difference);
    }

    let result: Array<MemoType> = [];
    return result
}

export default kNearestMemos;

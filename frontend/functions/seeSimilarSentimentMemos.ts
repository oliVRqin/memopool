import { Memo } from "@/types/memo";

export const seeSimilarSentimentMemos = async (memo: Memo) => {
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/find-memos-with-similar-sentiment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memo),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
        return data;
    })
    .catch(err => {
        console.error('Error in seeSimilarSentimentMemos:', err);
        throw err;
    });
}

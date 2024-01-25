

export const seePublicMemos = async () => {
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/see-public-memos`, {
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
        return data;
    }).catch(err => console.error('Error in handleSeePublicMemos:', err));
}


export type Memo = {
    id: string,
    sessionId: string,
    time: string,
    memo: string,
    sentimentScores: string,
    positivityScore: string,
    keyId: string | null,
    userId: string | null,
    tags: string[],
    visibility: string
}

export interface CSHUser {
    cn: string
    uid: string
}

export const formatUser = (u: CSHUser) => `${u.cn} (${u.uid})`

export interface QuoteShard {
    body: string
    speaker: CSHUser
}

export type Vote = "upvote" | "downvote" | null

export interface Quote {
    id: number
    shards: QuoteShard[]
    submitter: CSHUser
    timestamp: string
    score: number
    vote: Vote
    favorited: boolean
    hidden: {
        actor: CSHUser
        reason: string
    } | null
}

export interface Report {
    quote_id: number
    reports: [
        {
            reason: string
            timestamp: string
        },
    ]
}

export interface GitData {
    revision: string
    url: string
}

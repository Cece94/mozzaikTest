import { BASE_URL, checkStatus } from '../api'
import { GetUserByIdResponse } from './user'

export type GetMemeCommentsResponse = {
    total: number
    pageSize: number
    results: CommentResponseDto[]
}

export type CommentResponseDto = {
    id: string
    authorId: string
    memeId: string
    content: string
    createdAt: string
    author: GetUserByIdResponse
}

/**
 * Get comments for a meme
 * @param token
 * @param memeId
 * @returns
 */
export async function getMemeComments(
    token: string,
    memeId: string,
    page: number
): Promise<GetMemeCommentsResponse> {
    return await fetch(`${BASE_URL}/memes/${memeId}/comments?page=${page}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => checkStatus(res).json())
}

export type CreateCommentResponse = {
    id: string
    content: string
    createdAt: string
    authorId: string
    memeId: string
}

/**
 * Create a comment for a meme
 * @param token
 * @param memeId
 * @param content
 */
export async function createMemeComment(
    token: string,
    memeId: string,
    content: string
): Promise<CreateCommentResponse> {
    return await fetch(`${BASE_URL}/memes/${memeId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
    }).then((res) => checkStatus(res).json())
}

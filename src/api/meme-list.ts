import { BASE_URL, checkStatus } from '../api'

export type GetMemesResponse = {
    total: number
    pageSize: number
    results: MemeResponsDataDto[]
}

export type MemeResponsDataDto = {
    id: string
    authorId: string
    pictureUrl: string
    description: string
    commentsCount: string
    texts: {
        content: string
        x: number
        y: number
    }
    createdAt: string
}

/**
 * Get the list of memes for a given page
 * @param token
 * @param page
 * @returns
 */
export async function getMemes(
    token: string,
    page: number
): Promise<GetMemesResponse> {
    return await fetch(`${BASE_URL}/memes?page=${page}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => checkStatus(res).json())
}

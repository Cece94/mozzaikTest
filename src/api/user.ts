import { BASE_URL, checkStatus } from '../api'

export type GetUserByIdResponse = {
    id: string
    username: string
    pictureUrl: string
}

/**
 * Get a user by their id
 * @param token
 * @param id
 * @returns
 */
export async function getUserById(
    token: string,
    id: string
): Promise<GetUserByIdResponse> {
    return await fetch(`${BASE_URL}/users/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => checkStatus(res).json())
}

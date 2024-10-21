import { BASE_URL, checkStatus } from '../api'

type UUID = string & { __brand: 'UUID' }

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

/**
 * Get a list of users
 * @param token
 * @param userIds
 */
export async function getUsers(
    token: string,
    userIds: UUID[]
): Promise<GetUserByIdResponse[]> {
    const queryParams = new URLSearchParams()
    userIds.forEach((id) => {
        queryParams.append('ids', id)
    })

    const response = await fetch(`${BASE_URL}/users?${queryParams}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch users')
    }

    return response.json()
}

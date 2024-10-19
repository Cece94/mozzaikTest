export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class UnauthorizedError extends Error {
    constructor() {
        super('Unauthorized')
    }
}

export class NotFoundError extends Error {
    constructor() {
        super('Not Found')
    }
}

export function checkStatus(response: Response) {
    if (response.status === 401) {
        throw new UnauthorizedError()
    }
    if (response.status === 404) {
        throw new NotFoundError()
    }
    return response
}

export type LoginResponse = {
    jwt: string
}

/**
 * Authenticate the user with the given credentials
 * @param username
 * @param password
 * @returns
 */
export async function login(
    username: string,
    password: string
): Promise<LoginResponse> {
    return await fetch(`${BASE_URL}/authentication/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    }).then((res) => checkStatus(res).json())
}

import { BASE_URL, checkStatus } from '../api'
import { MemeResponsDataDto } from './meme-list'

export type CreateMemeRequest = {
    picture: File
    description: string
    texts: {
        content: string
        x: number
        y: number
    }[]
}

/**
 * Create a new meme
 * @param token
 * @param memeData
 * @returns
 */
export async function createMeme(
    token: string,
    memeData: CreateMemeRequest
): Promise<MemeResponsDataDto> {
    const formData = new FormData()

    formData.append('Picture', memeData.picture)
    formData.append('Description', memeData.description)

    memeData.texts.forEach((text, index) => {
        formData.append(`Texts[${index}].Content`, text.content)
        formData.append(`Texts[${index}].X`, text.x.toFixed(0).toString())
        formData.append(`Texts[${index}].Y`, text.y.toFixed(0).toString())
    })

    try {
        const response = await fetch(`${BASE_URL}/memes`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        throw error
    }
}

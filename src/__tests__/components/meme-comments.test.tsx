import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemeComment } from '../../components/meme-comment'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as AuthContext from '../../contexts/authentication'
import * as CommentApi from '../../api/comment'
import * as UserApi from '../../api/user'
import { memes, comments } from '../../../tests/mocks/handlers' // Import the memes mock
import { MemeResponsDataDto } from '../../api/meme-list'

vi.mock('../../contexts/authentication', () => ({
    useAuthToken: vi.fn(),
}))

vi.mock('../../api/comment', () => ({
    getMemeComments: vi.fn(),
    createMemeComment: vi.fn(),
}))

vi.mock('../../api/user', () => ({
    getUserById: vi.fn(),
    getUsers: vi.fn(), // Add this line to mock getUsers
}))

describe('MemeComment', () => {
    let queryClient: QueryClient
    const mockMeme: MemeResponsDataDto = memes[0]
    let mockComments = comments
    const mockNewComment = 'test comment 123'

    beforeEach(() => {
        queryClient = new QueryClient()
        vi.mocked(AuthContext.useAuthToken).mockReturnValue('mock-token')
        vi.mocked(UserApi.getUserById).mockResolvedValue({
            username: 'TestUser',
            pictureUrl: 'test-url',
            id: '',
        })
        vi.mocked(CommentApi.getMemeComments).mockResolvedValue({
            results: mockComments,
            total: mockComments.length,
            pageSize: 10,
        })
        vi.mocked(UserApi.getUsers).mockResolvedValue(
            mockComments.map((comment) => ({
                id: comment.authorId,
                username: comment.author.username,
                pictureUrl: comment.author.pictureUrl,
            }))
        )
    })

    it('sends the added comment correctly', async () => {
        vi.mocked(CommentApi.createMemeComment).mockImplementation(() => {
            const newComment = {
                id: 'new-comment-id',
                content: mockNewComment,
                createdAt: new Date().toISOString(),
                author: { id: 'user-id', username: 'TestUser' },
            }
            mockComments = [...mockComments, newComment]
            return Promise.resolve()
        })

        vi.mocked(CommentApi.getMemeComments).mockImplementation(() =>
            Promise.resolve({
                results: mockComments.map((comment) => ({
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    authorId: comment.authorId,
                    memeId: comment.memeId,
                    author: {
                        id: comment.authorId,
                        username: comment.author.username,
                        pictureUrl: comment.author.pictureUrl,
                    },
                })),
                total: mockComments.length,
                pageSize: 10,
            })
        )

        render(
            <QueryClientProvider client={queryClient}>
                <MemeComment meme={mockMeme} />
            </QueryClientProvider>
        )

        // Open the comment section
        fireEvent.click(
            screen.getByTestId(`meme-comments-section-${mockMeme.id}`)
        )

        // Wait for the comments to load
        await waitFor(() => {
            expect(screen.getAllByTestId(/meme-comment-content/)).toHaveLength(
                3
            )
        })
        // Type a comment
        const commentInput = await screen.findByPlaceholderText(
            'Type your comment here...'
        )
        fireEvent.change(commentInput, { target: { value: mockNewComment } })

        // Submit the comment
        const submitButton = screen.getByText('Commenter')
        fireEvent.click(submitButton)

        // Check if createMemeComment was called with the correct arguments
        await waitFor(() => {
            expect(CommentApi.createMemeComment).toHaveBeenCalledWith(
                'mock-token',
                mockMeme.id,
                mockNewComment
            )
        })

        // Check if the input is cleared after submission
        expect(commentInput).toHaveValue('')

        // Wait for the new comment to appear in the list
        await waitFor(
            () => {
                const commentElements =
                    screen.getAllByTestId(/meme-comment-content/)
                expect(commentElements).toHaveLength(4)
                expect(commentElements[3]).toHaveTextContent(mockNewComment)
            },
            { timeout: 2000 }
        )
    })
})

import { screen, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { AuthenticationContext } from '../../../contexts/authentication'
import { MemeFeedPage } from '../../../routes/_authentication/index'
import { renderWithRouter } from '../../utils'
import { getMemes } from '../../../api/meme-list'
import { getUsers } from '../../../api/user'

vi.mock('../../../api/meme-list')
vi.mock('../../../api/user')

describe('routes/_authentication/index', () => {
    describe('MemeFeedPage', () => {
        function renderMemeFeedPage() {
            return renderWithRouter({
                component: MemeFeedPage,
                Wrapper: ({ children }) => (
                    <ChakraProvider>
                        <QueryClientProvider client={new QueryClient()}>
                            <AuthenticationContext.Provider
                                value={{
                                    state: {
                                        isAuthenticated: true,
                                        userId: 'dummy_user_id',
                                        token: 'dummy_token',
                                    },
                                    authenticate: () => {},
                                    signout: () => {},
                                }}
                            >
                                {children}
                            </AuthenticationContext.Provider>
                        </QueryClientProvider>
                    </ChakraProvider>
                ),
            })
        }

        it('should fetch the memes and display them with their comments', async () => {
            vi.mocked(getMemes).mockResolvedValue({
                results: [
                    {
                        id: 'dummy_meme_id_1',
                        authorId: 'dummy_user_id_1',
                        pictureUrl: 'https://dummy.url/meme/1',
                        texts: [
                            { content: 'dummy text 1', x: 0, y: 0 },
                            { content: 'dummy text 2', x: 100, y: 100 },
                        ],
                        description: 'dummy meme 1',
                        comments: [
                            {
                                id: 'dummy_comment_id_1',
                                authorId: 'dummy_user_id_1',
                                content: 'dummy comment 1',
                            },
                            {
                                id: 'dummy_comment_id_2',
                                authorId: 'dummy_user_id_2',
                                content: 'dummy comment 2',
                            },
                            {
                                id: 'dummy_comment_id_3',
                                authorId: 'dummy_user_id_3',
                                content: 'dummy comment 3',
                            },
                        ],
                        commentsCount: 3,
                    },
                ],
                total: 1,
                pageSize: 10,
            })

            vi.mocked(getUsers).mockResolvedValue([
                {
                    id: 'dummy_user_id_1',
                    username: 'dummy_user_1',
                    pictureUrl: '',
                },
                {
                    id: 'dummy_user_id_2',
                    username: 'dummy_user_2',
                    pictureUrl: '',
                },
                {
                    id: 'dummy_user_id_3',
                    username: 'dummy_user_3',
                    pictureUrl: '',
                },
            ])

            renderMemeFeedPage()

            await waitFor(() => {
                // We check that the right author's username is displayed
                expect(
                    screen.getByTestId('meme-author-dummy_meme_id_1')
                ).toHaveTextContent('dummy_user_1')

                // We check that the right meme's picture is displayed
                expect(
                    screen.getByTestId('meme-picture-dummy_meme_id_1')
                ).toHaveStyle({
                    'background-image': 'url("https://dummy.url/meme/1")',
                })

                // We check that the right texts are displayed at the right positions
                const text1 = screen.getByTestId(
                    'meme-picture-dummy_meme_id_1-text-0'
                )
                const text2 = screen.getByTestId(
                    'meme-picture-dummy_meme_id_1-text-1'
                )
                expect(text1).toHaveTextContent('dummy text 1')
                expect(text1).toHaveStyle({
                    top: '0px',
                    left: '0px',
                })
                expect(text2).toHaveTextContent('dummy text 2')
                expect(text2).toHaveStyle({
                    top: '100px',
                    left: '100px',
                })

                // We check that the right description is displayed
                expect(
                    screen.getByTestId('meme-description-dummy_meme_id_1')
                ).toHaveTextContent('dummy meme 1')

                // We check that the right number of comments is displayed
                expect(
                    screen.getByTestId('meme-comments-count-dummy_meme_id_1')
                ).toHaveTextContent('3 comments')

                // We check that the right comments with the right authors are displayed
                // We do not check for the content of the comments because we now have a comment Component where we can test that

                /* 
                
                expect(
                    screen.getByTestId(
                        'meme-comment-content-dummy_meme_id_1-dummy_comment_id_1'
                    )
                ).toHaveTextContent('dummy comment 1')
                expect(
                    screen.getByTestId(
                        'meme-comment-author-dummy_meme_id_1-dummy_comment_id_1'
                    )
                ).toHaveTextContent('dummy_user_1')

                expect(
                    screen.getByTestId(
                        'meme-comment-content-dummy_meme_id_1-dummy_comment_id_2'
                    )
                ).toHaveTextContent('dummy comment 2')
                expect(
                    screen.getByTestId(
                        'meme-comment-author-dummy_meme_id_1-dummy_comment_id_2'
                    )
                ).toHaveTextContent('dummy_user_2')

                expect(
                    screen.getByTestId(
                        'meme-comment-content-dummy_meme_id_1-dummy_comment_id_3'
                    )
                ).toHaveTextContent('dummy comment 3')
                expect(
                    screen.getByTestId(
                        'meme-comment-author-dummy_meme_id_1-dummy_comment_id_3'
                    )
                ).toHaveTextContent('dummy_user_3') */
            })
        })
    })
})

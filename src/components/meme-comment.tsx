import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import {
    Avatar,
    Box,
    Collapse,
    Flex,
    Icon,
    LinkBox,
    LinkOverlay,
    Text,
    Input,
    VStack,
    Button,
    Stack,
} from '@chakra-ui/react'
import { CaretDown, CaretUp, Chat } from '@phosphor-icons/react'
import { format } from 'timeago.js'
import { getUserById, getUsers } from '../api/user'
import { useAuthToken } from '../contexts/authentication'
import { Loader } from '../components/loader'
import { Fragment, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import {
    createMemeComment,
    getMemeComments,
    GetMemeCommentsResponse,
} from '../api/comment'
import { MemeResponsDataDto } from '../api/meme-list'

interface MemeCommentProps {
    meme: MemeResponsDataDto
}

export const MemeComment: React.FC<MemeCommentProps> = ({ meme }) => {
    const token = useAuthToken()
    const queryClient = useQueryClient()

    // Fetch comments for the meme using infinite query
    const {
        isLoading,
        fetchNextPage,
        hasNextPage,
        data: commentData,
        refetch,
    } = useInfiniteQuery<GetMemeCommentsResponse, Error>({
        queryKey: ['comments', meme.id],
        queryFn: async ({ pageParam = 1 }) => {
            // Fetch comments for this meme
            const comments = await getMemeComments(
                token,
                meme.id,
                pageParam as number
            )

            // Fetch all author info in one go for efficiency
            const authorIds = [
                ...new Set(comments.results.map((comment) => comment.authorId)),
            ]
            const authors = await getUsers(token, authorIds)

            // Create a map of user IDs to user objects
            const userMap = new Map(
                authors.map((author) => [author.id, author])
            )

            // Enhance comments with author info
            const enhancedResults = comments.results.map((comment) => ({
                ...comment,
                author: userMap.get(comment.authorId) || {
                    id: comment.authorId,
                    username: 'Unnamed',
                    pictureUrl: '',
                },
            }))

            return {
                ...comments,
                results: enhancedResults,
            }
        },

        // Determine if there are more comments to load
        getNextPageParam: (lastPage, allPages) => {
            const nextPage = allPages.length + 1
            return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize)
                ? nextPage
                : undefined
        },
        initialPageParam: 1,
        enabled: false, // Manual trigger when needed
    })

    // Flatten the comment data for easier rendering
    const memeCommentList: GetMemeCommentsResponse['results'] =
        commentData?.pages.flatMap((page) => page.results) || []

    // Calculate current page and total pages for pagination
    const currentPage = commentData ? commentData.pages.length : 0
    const totalPages = commentData?.pages[0]
        ? Math.ceil(commentData.pages[0].total / commentData.pages[0].pageSize)
        : 0

    // Fetch current user data
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return await getUserById(token, jwtDecode<{ id: string }>(token).id)
        },
    })

    // State for comment section visibility
    const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false)

    // Toggle comment section and fetch comments when opening
    const handleCommentSectionToggle = () => {
        setIsCommentSectionOpen((prevState) => !prevState)
        if (!isCommentSectionOpen) {
            refetch() // Fetch comments when opening the section
        }
    }

    // State for comment input
    const [commentContent, setCommentContent] = useState<{
        [key: string]: string
    }>({ [meme.id]: '' })

    // Mutation for creating a new comment
    const { mutate } = useMutation({
        mutationFn: async (data: { memeId: string; content: string }) => {
            await createMemeComment(token, data.memeId, data.content)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', meme.id] })
            refetch()
            setCommentContent((prevState) => ({ ...prevState, [meme.id]: '' }))
        },
    })

    if (isLoading && !isCommentSectionOpen) {
        return <Loader data-testid="meme-comment-loader" />
    }

    return (
        <Fragment>
            <LinkBox as={Box} py={2} borderBottom="1px solid black">
                <Flex justifyContent="space-between" alignItems="center">
                    <Flex alignItems="center">
                        <LinkOverlay
                            data-testid={`meme-comments-section-${meme.id}`}
                            cursor="pointer"
                            onClick={handleCommentSectionToggle}
                        >
                            <Text
                                data-testid={`meme-comments-count-${meme.id}`}
                            >
                                {commentData?.pages[0]?.total ||
                                    meme.commentsCount}{' '}
                                comments
                            </Text>
                        </LinkOverlay>
                        <Icon
                            as={!isCommentSectionOpen ? CaretDown : CaretUp}
                            ml={2}
                            mt={1}
                        />
                    </Flex>
                    <Icon as={Chat} />
                </Flex>
            </LinkBox>
            <Collapse in={isCommentSectionOpen} animateOpacity>
                <Box mb={6}>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (commentContent[meme.id]) {
                                mutate({
                                    memeId: meme.id,
                                    content: commentContent[meme.id],
                                })
                            }
                        }}
                    >
                        <Flex alignItems="center">
                            <Avatar
                                borderWidth="1px"
                                borderColor="gray.300"
                                name={user?.username}
                                src={user?.pictureUrl}
                                size="sm"
                                mr={2}
                            />
                            <Input
                                placeholder="Type your comment here..."
                                onChange={(event) => {
                                    setCommentContent({
                                        ...commentContent,
                                        [meme.id]: event.target.value,
                                    })
                                }}
                                value={commentContent[meme.id]}
                            />
                            <Button type="submit" colorScheme="blue">
                                Commenter
                            </Button>
                        </Flex>
                    </form>
                </Box>
                {
                    <VStack align="stretch" spacing={4}>
                        {memeCommentList.map((comment) => (
                            <Flex key={comment.id}>
                                <Avatar
                                    borderWidth="1px"
                                    borderColor="gray.300"
                                    size="sm"
                                    name={comment?.author?.username}
                                    src={comment?.author?.pictureUrl}
                                    mr={2}
                                />
                                <Box
                                    p={2}
                                    borderRadius={8}
                                    bg="gray.50"
                                    flexGrow={1}
                                >
                                    <Flex
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Flex>
                                            <Text
                                                data-testid={`meme-comment-author-${meme.id}-${comment.id}`}
                                            >
                                                {comment?.author?.username}
                                            </Text>
                                        </Flex>
                                        <Text
                                            fontStyle="italic"
                                            color="gray.500"
                                            fontSize="small"
                                        >
                                            {format(comment.createdAt)}
                                        </Text>
                                    </Flex>
                                    <Text
                                        color="gray.500"
                                        whiteSpace="pre-line"
                                        data-testid={`meme-comment-content-${meme.id}-${comment.id}`}
                                    >
                                        {comment.content}
                                    </Text>
                                </Box>
                            </Flex>
                        ))}
                        {currentPage < totalPages ? (
                            <Button onClick={() => fetchNextPage()}>
                                Voir plus
                            </Button>
                        ) : null}
                    </VStack>
                }
            </Collapse>
        </Fragment>
    )
}

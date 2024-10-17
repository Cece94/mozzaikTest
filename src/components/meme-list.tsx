import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    Avatar,
    Box,
    Collapse,
    Flex,
    Icon,
    LinkBox,
    LinkOverlay,
    StackDivider,
    Text,
    Input,
    VStack,
    Button,
    Stack,
} from '@chakra-ui/react'
import { CaretDown, CaretUp, Chat } from '@phosphor-icons/react'
import { format } from 'timeago.js'
import {
    createMemeComment,
    getMemeComments,
    GetMemeCommentsResponse,
    getMemes,
    GetMemesResponse,
    getUserById,
    GetUserByIdResponse,
    MemeResponsDataDto,
} from '../api'
import { useAuthToken } from '../contexts/authentication'
import { Loader } from '../components/loader'
import { MemePicture } from '../components/meme-picture'
import { Fragment, useRef, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { fetchMemes } from '../services/memeService'

export const MemeList: React.FC = () => {
    const token = useAuthToken()
    console.log('toto')
    /*  const {isLoading} = useQuery<GetMemesResponse, Error>({
        queryKey: ['memes', page],
        queryFn: async () => {
       
             const memesWithAuthorAndComments = []
            for (let meme of memes) {
                const author = await getUserById(token, meme.authorId)
                const comments: GetMemeCommentsResponse['results'] = []
                const firstPage = await getMemeComments(token, meme.id, 1)
                comments.push(...firstPage.results)
                const remainingCommentPages =
                    Math.ceil(firstPage.total / firstPage.pageSize) - 1
                for (let i = 0; i < remainingCommentPages; i++) {
                    const page = await getMemeComments(token, meme.id, i + 2)
                    comments.push(...page.results)
                }
                const commentsWithAuthor: (GetMemeCommentsResponse['results'][0] & {
                    author: GetUserByIdResponse
                })[] = []
                for (let comment of comments) {
                    const author = await getUserById(token, comment.authorId)
                    commentsWithAuthor.push({ ...comment, author })
                }
                memesWithAuthorAndComments.push({
                    ...meme,
                    author,
                    comments: commentsWithAuthor,
                })
            }
            return <memesWithAuthorAndComments></memesWithAuthorAndComments>
        },
    })*/

    const { isLoading, fetchNextPage, hasNextPage, data } = useInfiniteQuery<
        GetMemesResponse,
        Error
    >({
        queryKey: ['memes'],
        queryFn: ({ pageParam = 1 }) => fetchMemes(token, pageParam as number),
        getNextPageParam: (lastPage, allPages) => {
            const nextPage = allPages.length + 1
            return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize)
                ? nextPage
                : undefined
        },
        initialPageParam: 1,
    })

    const memeList: GetMemesResponse['results'] =
        data?.pages.flatMap((page) => page.results) || []

    const currentPage = data ? data.pages.length : 0
    const totalPages = data?.pages[0]
        ? Math.ceil(data.pages[0].total / data.pages[0].pageSize)
        : 0

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage()
        }
    }

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return await getUserById(token, jwtDecode<{ id: string }>(token).id)
        },
    })
    const [openedCommentSection, setOpenedCommentSection] = useState<
        string | null
    >(null)
    const [commentContent, setCommentContent] = useState<{
        [key: string]: string
    }>({})
    const { mutate } = useMutation({
        mutationFn: async (data: { memeId: string; content: string }) => {
            await createMemeComment(token, data.memeId, data.content)
        },
    })
    if (isLoading) {
        return <Loader data-testid="meme-feed-loader" />
    }

    return (
        <Fragment>
            {memeList?.map((meme) => (
                <VStack key={meme.id} p={4} width="full" align="stretch">
                    <Flex justifyContent="space-between" alignItems="center">
                        {/* <Flex>
                                <Avatar
                                    borderWidth="1px"
                                    borderColor="gray.300"
                                    size="xs"
                                    name={meme.author.username}
                                    src={meme.author.pictureUrl}
                                />
                                <Text
                                    ml={2}
                                    data-testid={`meme-author-${meme.id}`}
                                >
                                    {meme.author.username}
                                </Text>
                            </Flex> */}
                        <Text
                            fontStyle="italic"
                            color="gray.500"
                            fontSize="small"
                        >
                            {format(meme.createdAt)}
                        </Text>
                    </Flex>
                    <MemePicture
                        pictureUrl={meme.pictureUrl}
                        texts={meme.texts}
                        dataTestId={`meme-picture-${meme.id}`}
                    />
                    <Box>
                        <Text fontWeight="bold" fontSize="medium" mb={2}>
                            Description:{' '}
                        </Text>
                        <Box
                            p={2}
                            borderRadius={8}
                            border="1px solid"
                            borderColor="gray.100"
                        >
                            <Text
                                color="gray.500"
                                whiteSpace="pre-line"
                                data-testid={`meme-description-${meme.id}`}
                            >
                                {meme.description}
                            </Text>
                        </Box>
                    </Box>
                    <LinkBox as={Box} py={2} borderBottom="1px solid black">
                        <Flex
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Flex alignItems="center">
                                <LinkOverlay
                                    data-testid={`meme-comments-section-${meme.id}`}
                                    cursor="pointer"
                                    onClick={() =>
                                        setOpenedCommentSection(
                                            openedCommentSection === meme.id
                                                ? null
                                                : meme.id
                                        )
                                    }
                                >
                                    <Text
                                        data-testid={`meme-comments-count-${meme.id}`}
                                    >
                                        {meme.commentsCount} comments
                                    </Text>
                                </LinkOverlay>
                                <Icon
                                    as={
                                        openedCommentSection !== meme.id
                                            ? CaretDown
                                            : CaretUp
                                    }
                                    ml={2}
                                    mt={1}
                                />
                            </Flex>
                            <Icon as={Chat} />
                        </Flex>
                    </LinkBox>
                    <Collapse
                        in={openedCommentSection === meme.id}
                        animateOpacity
                    >
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
                                </Flex>
                            </form>
                        </Box>
                        {/* <VStack align="stretch" spacing={4}>
                                {meme.comments.map((comment) => (
                                    <Flex key={comment.id}>
                                        <Avatar
                                            borderWidth="1px"
                                            borderColor="gray.300"
                                            size="sm"
                                            name={comment.author.username}
                                            src={comment.author.pictureUrl}
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
                                                        {
                                                            comment.author
                                                                .username
                                                        }
                                                    </Text>
                                                </Flex>
                                                <Text
                                                    fontStyle="italic"
                                                    color="gray.500"
                                                    fontSize="small"
                                                >
                                                    {format(
                                                        comment.createdAt
                                                    )}
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
                            </VStack> */}
                    </Collapse>
                </VStack>
            ))}

            <Stack spacing={4} direction="row" align="center">
                <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleLoadMore}
                    isDisabled={!hasNextPage || isLoading}
                >
                    Voir plus {currentPage} / {totalPages}
                </Button>
            </Stack>
        </Fragment>
    )
}

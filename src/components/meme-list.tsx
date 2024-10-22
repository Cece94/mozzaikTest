import {
    useInfiniteQuery,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import {
    Box,
    Flex,
    Text,
    VStack,
    Button,
    Stack,
    Avatar,
} from '@chakra-ui/react'
import { format } from 'timeago.js'
import { getUserById, GetUserByIdResponse, getUsers } from '../api/user'
import { useAuthToken } from '../contexts/authentication'
import { Loader } from '../components/loader'
import { MemePicture } from '../components/meme-picture'
import { Fragment, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import {
    getMemes,
    GetMemesResponse,
    MemeResponsDataDto,
} from '../api/meme-list'
import { MemeComment } from './meme-comment'

export const MemeList: React.FC = () => {
    const token = useAuthToken()
    const queryClient = useQueryClient()

    const {
        isLoading,
        fetchNextPage,
        hasNextPage,
        data: memeListData,
    } = useInfiniteQuery<GetMemesResponse, Error>({
        queryKey: ['memes'],
        queryFn: ({ pageParam = 1 }) => getMemes(token, pageParam as number),
        getNextPageParam: (lastPage, allPages) => {
            const nextPage = allPages.length + 1
            return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize)
                ? nextPage
                : undefined
        },
        initialPageParam: 1,
    })

    useEffect(() => {
        if (memeListData) {
            const updateMemeAuthors = async () => {
                const newAuthorIds = memeListData.pages.flatMap((page) =>
                    page.results.map((meme) => meme.authorId)
                )
                const uniqueNewAuthorIds = [...new Set(newAuthorIds)]

                const authors = await getUsers(token, uniqueNewAuthorIds)
                const authorMap = Object.fromEntries(
                    authors.map((author) => [author.id, author])
                )

                const tempMemeList = JSON.parse(JSON.stringify(memeListData))
                tempMemeList.pages.forEach((page: any) => {
                    page.results.forEach((meme: MemeResponsDataDto) => {
                        meme.author = authorMap[meme.authorId]
                    })
                })

                queryClient.setQueryData(['memes'], tempMemeList)
            }

            updateMemeAuthors()
        }
    }, [memeListData])

    const memeList: GetMemesResponse['results'] =
        memeListData?.pages.flatMap((page) => page.results) || []

    const currentPage = memeListData ? memeListData.pages.length : 0
    const totalPages = memeListData?.pages[0]
        ? Math.ceil(
              memeListData.pages[0].total / memeListData.pages[0].pageSize
          )
        : 0

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage()
        }
    }

    if (isLoading) {
        return <Loader data-testid="meme-feed-loader" />
    }

    return (
        <Fragment>
            {memeList?.map((meme) => (
                <VStack key={meme.id} p={4} width="full" align="stretch">
                    <Flex justifyContent="space-between" alignItems="center">
                        {
                            <Flex>
                                <Avatar
                                    borderWidth="1px"
                                    borderColor="gray.300"
                                    size="xs"
                                    name={meme.author?.username}
                                    src={meme.author?.pictureUrl}
                                />
                                <Text
                                    ml={2}
                                    data-testid={`meme-author-${meme.id}`}
                                >
                                    {meme.author?.username}
                                </Text>
                            </Flex>
                        }
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
                        isDraggable={false}
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

                    {<MemeComment meme={meme} />}
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

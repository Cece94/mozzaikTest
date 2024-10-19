import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
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
import { getUserById } from '../api/user'
import { useAuthToken } from '../contexts/authentication'
import { Loader } from '../components/loader'
import { MemePicture } from '../components/meme-picture'
import { Fragment, useRef, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getMemes, GetMemesResponse } from '../api/meme-list'
import { MemeComment } from './meme-comment'

export const MemeList: React.FC = () => {
    const token = useAuthToken()

    const { isLoading, fetchNextPage, hasNextPage, data } = useInfiniteQuery<
        GetMemesResponse,
        Error
    >({
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

    if (isLoading) {
        return <Loader data-testid="meme-feed-loader" />
    }

    return (
        <Fragment>
            {memeList?.map((meme) => (
                <VStack key={meme.id} p={4} width="full" align="stretch">
                    <Flex justifyContent="space-between" alignItems="center">
                        {/*
                            <Flex>
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
                            </Flex>
                        */}
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

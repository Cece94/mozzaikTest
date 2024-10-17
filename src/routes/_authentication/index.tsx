import { createFileRoute } from '@tanstack/react-router'
import { Flex, StackDivider, VStack } from '@chakra-ui/react'
import { MemeList } from '../../components/meme-list'

export const MemeFeedPage: React.FC = () => {
    return (
        <Flex
            width="full"
            height="full"
            justifyContent="center"
            overflowY="auto"
        >
            <VStack
                p={4}
                width="full"
                maxWidth={800}
                divider={<StackDivider border="gray.200" />}
            >
                <MemeList />
            </VStack>
        </Flex>
    )
}

export const Route = createFileRoute('/_authentication/')({
    component: MemeFeedPage,
})

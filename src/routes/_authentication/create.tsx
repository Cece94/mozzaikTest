import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    Textarea,
    VStack,
} from '@chakra-ui/react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { MemeEditor } from '../../components/meme-editor'
import { useMemo, useState } from 'react'
import { MemePictureProps } from '../../components/meme-picture'
import { Plus, Trash } from '@phosphor-icons/react'
import { createMeme, CreateMemeRequest } from '../../api/meme-editor'
import { useAuthToken } from '../../contexts/authentication'
import { v4 as uuidv4 } from 'uuid'

export const Route = createFileRoute('/_authentication/create')({
    component: CreateMemePage,
})

type Picture = {
    url: string
    file: File
}

function CreateMemePage() {
    const [picture, setPicture] = useState<Picture | null>(null)
    const [texts, setTexts] = useState<MemePictureProps['texts']>([])

    const [description, setDescription] = useState('')

    const token = useAuthToken()
    const navigate = useNavigate()

    const handleDescriptionChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setDescription(event.target.value)
    }

    const handleDrop = (file: File) => {
        setPicture({
            url: URL.createObjectURL(file),
            file,
        })
    }

    const handleAddCaptionButtonClick = () => {
        const newCaption = {
            index: uuidv4(),

            content: `New caption ${texts.length + 1}`,
            x: Math.random() * 400,
            y: Math.random() * 225,
        }
        setTexts([...texts, newCaption])
    }

    const handleDeleteCaptionButtonClick = (index: number) => {
        setTexts(texts.filter((_, i) => i !== index))
    }

    const handleTextChange = (index: number, content: string) => {
        setTexts(
            texts.map((text, i) => (i === index ? { ...text, content } : text))
        )
    }

    const handleSubmit = async () => {
        if (picture) {
            const memeToSave: CreateMemeRequest = {
                picture: picture.file,
                description: description,
                texts: texts,
            }
            const response = await createMeme(token, memeToSave)
            navigate({ to: '/' })
        }
    }

    const handleTextsUpdate = (updatedTexts: MemePictureProps['texts']) => {
        setTexts(updatedTexts)
    }

    const memePicture = useMemo(() => {
        if (!picture) {
            return undefined
        }

        return {
            pictureUrl: picture.url,
            texts,
        }
    }, [picture, texts])

    return (
        <Flex width="full" height="full">
            <Box flexGrow={1} height="full" p={4} overflowY="auto">
                <VStack spacing={5} align="stretch">
                    <Box>
                        <Heading as="h2" size="md" mb={2}>
                            Upload your picture
                        </Heading>
                        <MemeEditor
                            onDrop={handleDrop}
                            memePicture={memePicture}
                            onTextsUpdate={handleTextsUpdate}
                        />
                    </Box>
                    <Box>
                        <Heading as="h2" size="md" mb={2}>
                            Describe your meme
                        </Heading>
                        <Textarea
                            placeholder="Type your description here..."
                            value={description}
                            onChange={handleDescriptionChange}
                        />
                    </Box>
                </VStack>
            </Box>
            <Flex
                flexDir="column"
                width="30%"
                minW="250"
                height="full"
                boxShadow="lg"
            >
                <Heading as="h2" size="md" mb={2} p={4}>
                    Add your captions
                </Heading>
                <Box p={4} flexGrow={1} height={0} overflowY="auto">
                    <VStack>
                        {texts.map((text, index) => (
                            <Flex key={index} width="full">
                                <Input
                                    key={index}
                                    value={text.content}
                                    onChange={(e) =>
                                        handleTextChange(index, e.target.value)
                                    }
                                    mr={1}
                                />
                                <IconButton
                                    onClick={() =>
                                        handleDeleteCaptionButtonClick(index)
                                    }
                                    aria-label="Delete caption"
                                    icon={<Icon as={Trash} />}
                                />
                            </Flex>
                        ))}
                        <Button
                            colorScheme="cyan"
                            leftIcon={<Icon as={Plus} />}
                            variant="ghost"
                            size="sm"
                            width="full"
                            onClick={handleAddCaptionButtonClick}
                            isDisabled={memePicture === undefined}
                        >
                            Add a caption
                        </Button>
                    </VStack>
                </Box>
                <HStack p={4}>
                    <Button
                        as={Link}
                        to="/"
                        colorScheme="cyan"
                        variant="outline"
                        size="sm"
                        width="full"
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="cyan"
                        size="sm"
                        width="full"
                        color="white"
                        isDisabled={memePicture === undefined}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </HStack>
            </Flex>
        </Flex>
    )
}

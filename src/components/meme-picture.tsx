import { Box, Text, useDimensions } from '@chakra-ui/react'
import React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'

export type MemePictureProps = {
    pictureUrl: string
    texts: {
        content: string
        x: number
        y: number
    }[]
    dataTestId?: string
    onTextsUpdate: (updatedTexts: MemePictureProps['texts']) => void
    isDraggable?: boolean
}

const REF_WIDTH = 800
const REF_HEIGHT = 450
const REF_FONT_SIZE = 36

export const MemePicture: React.FC<MemePictureProps> = ({
    pictureUrl,
    texts: rawTexts,
    dataTestId = '',
    onTextsUpdate,
    isDraggable = true,
}) => {
    // Reference to the container div for measuring dimensions
    const containerRef = useRef<HTMLDivElement>(null)
    const dimensions = useDimensions(containerRef, true)
    const boxWidth = dimensions?.borderBox.width

    // Local state to manage texts
    const [localTexts, setLocalTexts] = useState(rawTexts)

    // Update local texts when rawTexts prop changes
    useEffect(() => {
        setLocalTexts(rawTexts)
    }, [rawTexts])

    // Calculate height, font size, and scaled text positions based on container width
    const { height, fontSize, scaledTexts } = useMemo(() => {
        if (!boxWidth) {
            return { height: 0, fontSize: 0, texts: rawTexts }
        }

        return {
            height: (boxWidth / REF_WIDTH) * REF_HEIGHT,
            fontSize: (boxWidth / REF_WIDTH) * REF_FONT_SIZE,
            scaledTexts: localTexts.map((text) => ({
                ...text,
                x: (boxWidth / REF_WIDTH) * text.x,
                y: (boxWidth / REF_WIDTH) * text.y,
            })),
        }
    }, [boxWidth, localTexts])

    // State to track the currently selected text
    const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(
        null
    )

    // Handle drag events for text elements
    const handleDrag = (
        index: number,
        e: DraggableEvent,
        data: DraggableData
    ) => {
        if (!boxWidth) return

        const scale = boxWidth / REF_WIDTH

        // Update the position of the dragged text
        const updatedLocalTexts = [...localTexts]
        updatedLocalTexts[index] = {
            ...updatedLocalTexts[index],
            x: data.x / scale, // Reverse scale to store original coordinates
            y: data.y / scale,
        }

        // Update local state and propagate changes to parent
        setLocalTexts(updatedLocalTexts)

        // Propagate the changes to the parent
        onTextsUpdate(updatedLocalTexts)
    }

    return (
        <Box
            width="full"
            height={height}
            ref={containerRef}
            backgroundImage={pictureUrl}
            backgroundColor="gray.100"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            backgroundSize="contain"
            overflow="hidden"
            position="relative"
            borderRadius={8}
            data-testid={dataTestId}
        >
            {scaledTexts?.map((text, index) => (
                /** to remove warning we can use this solution: https://github.com/react-grid-layout/react-draggable/blob/v4.4.2/lib/DraggableCore.js#L159-L171
                 * but it creates a new div for each text and can involve a bug
                 * there is also the possibility to remove strictMode but it's not a good solution
                 */
                <Draggable
                    key={index}
                    position={{ x: text.x, y: text.y }}
                    onStop={(e, data) => handleDrag(index, e, data)}
                    bounds="parent"
                    disabled={!isDraggable}
                >
                    <Text
                        key={index}
                        position="absolute"
                        fontSize={fontSize}
                        color={
                            selectedTextIndex === index && isDraggable
                                ? 'blue'
                                : 'white'
                        }
                        fontFamily="Impact"
                        fontWeight="bold"
                        userSelect="none"
                        textTransform="uppercase"
                        cursor="pointer"
                        style={{
                            WebkitTextStroke: '1px black',
                            position: 'absolute',
                        }}
                        data-testid={`${dataTestId}-text-${index}`}
                        onClick={() => setSelectedTextIndex(index)}
                    >
                        {text.content}
                    </Text>
                </Draggable>
            ))}
        </Box>
    )
}

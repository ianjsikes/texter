import React from 'react'
import { Box, Text, Card, Heading } from 'rebass'

export default ({ onPress, title, segmentName, message, sent }) => {
  return (
    <Box p={2} onClick={onPress}>
      <Card color="orange">
        <Heading color="white" bg="orange">
          {title}
        </Heading>
        <Box p={3}>
          <Heading>{segmentName}</Heading>
          <Text>{message}</Text>
        </Box>
      </Card>
    </Box>
  )
}

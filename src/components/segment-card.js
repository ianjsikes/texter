import React from 'react'
import { Flex, Box, Card, Text, Heading } from 'rebass'
import FA from 'react-fontawesome'

export default ({
  onPress,
  name,
  lastCampaignName,
  numMembers,
  numUnread,
  hasUnread,
}) => {
  return (
    <Box p={2} onClick={onPress}>
      <Card style={{ position: 'relative', overflow: 'visible' }}>
        <Flex>
          <Box flex="1">
            <Heading>{name}</Heading>
            <Text>{lastCampaignName}</Text>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <Text fontSize={[1]} style={{ display: 'block', flex: 1 }}>
              <Text fontSize={[1]} pr={2}>
                {numMembers}
              </Text>
              <FA name="users" />
            </Text>
            <Box
              sx={{
                display: 'inline-block',
                color: 'white',
                bg: 'primary',
                px: 2,
                py: 1,
                borderRadius: 9999,
              }}
            >
              <Text fontSize={[1]} pr={2}>
                {numUnread}
              </Text>
              <FA name="envelope" />
            </Box>
          </Box>
        </Flex>
        {hasUnread && (
          <FA
            name="exclamation-circle"
            style={{
              position: 'absolute',
              top: -5,
              left: -5,
              color: 'orange',
            }}
          />
        )}
      </Card>
    </Box>
  )
}

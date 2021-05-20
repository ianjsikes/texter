import React from 'react'
import { Box, Button } from 'rebass'
import FA from 'react-fontawesome'

export default ({ onClick, disabled }) => (
  <Box mb={2}>
    <Button
      variant="outline"
      color="blue"
      mb={2}
      onClick={onClick}
      disabled={disabled}
    >
      <FA size="2x" name="arrow-left" />
    </Button>
  </Box>
)

import React from 'react'
import { Box, Text, Button } from 'rebass'
import { Select, Textarea as RbTextarea } from '@rebass/forms'
import ReactFileReader from 'react-file-reader'

export const Dropdown = ({ options, value, onChange }) => (
  <Select value={value} onChange={onChange}>
    {options.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </Select>
)

export const Textarea = ({ value, onChange }) => (
  <Box>
    <RbTextarea value={value} onChange={onChange} />
    <Text fontSize={[1]}>{`${value.length} / 160`}</Text>
  </Box>
)

export const FileInput = ({ value, onChange }) => (
  <ReactFileReader fileTypes={['.csv']} handleFiles={onChange}>
    <Box>
      <Text>{value && value.fileName}</Text>
      <Button>Upload</Button>
    </Box>
  </ReactFileReader>
)

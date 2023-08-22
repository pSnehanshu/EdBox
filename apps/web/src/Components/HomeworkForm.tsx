import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  Input,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
  Textarea,
  Text,
} from "@chakra-ui/react";
import { MdOutlineFileUpload } from "react-icons/md";

export default function HomeworkForm() {
  return (
    <>
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Create new Home Works</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Stack spacing={3} mx={8}>
          <Flex gap={8}>
            <Select placeholder="Class" size="lg"></Select>
            <Select placeholder="Section" size="lg"></Select>
          </Flex>
          <Select placeholder="Subject" size="lg"></Select>
          <Input
            placeholder="Due date (optional)"
            size="md"
            type="datetime-local"
          />
          <Textarea placeholder="Description (optional)" size="md" />
          <Flex justifyContent="center" gap={2}>
            <MdOutlineFileUpload size={28} />
            <Text fontSize="lg" fontWeight="semibold">
              Upload File
            </Text>
          </Flex>
        </Stack>
        <ModalFooter>
          <Flex justifyContent="center">
            <CloseIcon boxSize={"5"} />
            <CheckIcon boxSize={"6"} />
          </Flex>
        </ModalFooter>
      </ModalContent>
    </>
  );
}

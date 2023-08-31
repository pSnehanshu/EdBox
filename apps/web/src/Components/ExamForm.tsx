import { useState } from "react";
import { CheckIcon } from "@chakra-ui/icons";
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
  Button,
} from "@chakra-ui/react";
import { MdOutlineFileUpload } from "react-icons/md";
import { trpc } from "../utils/trpc";
import { useConfig } from "../utils/atoms";
import { Section, Homework, RouterInput } from "schooltalk-shared/types";
import { format, parseISO } from "date-fns";

export default function HomeworkForm() {
  const { schoolId: selectedSchoolId } = useConfig();

  const [textContent, setTextContent] = useState("");

  return (
    <>
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Create new Exam</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Stack spacing={3} mx={8}>
          <Textarea
            placeholder="Description (optional)"
            size="md"
            onChange={(e) => setTextContent(e.target.value)}
            value={textContent ?? null}
          />
        </Stack>
        <Button>Add Tests</Button>
        {/* list of tests */}
        {/* create tests popup */}
        <ModalFooter>
          <Flex justifyContent="center">
            <Button isLoading={false}>
              <CheckIcon boxSize={"6"} />
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </>
  );
}

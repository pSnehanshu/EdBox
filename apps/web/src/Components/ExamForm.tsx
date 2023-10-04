import { useState } from "react";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
  Textarea,
  Text,
  Button,
  useDisclosure,
  Modal,
} from "@chakra-ui/react";

import { trpc } from "../utils/trpc";
import { useConfig } from "../utils/atoms";
import { ExamTestSchema } from "schooltalk-shared/misc";
import { TestForm } from "./TestForm";

export default function ExamForm() {
  const { schoolId: selectedSchoolId } = useConfig();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [textContent, setTextContent] = useState("");

  const [selectedTests, setTest] = useState<ExamTestSchema[]>([]);

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
        <Flex justifyContent="end" m={8}>
          <Button
            onClick={() => {
              onOpen();
            }}
          >
            Add New Tests
          </Button>
        </Flex>
        {/* list of tests */}
        <Heading size="sm" mx={8}>
          Tests
        </Heading>
        {/* create tests popup */}
        <ModalFooter>
          <Flex justifyContent="center">
            <Button isLoading={false}>
              <CheckIcon boxSize={"6"} />
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>

      <Modal isOpen={isOpen} onClose={onClose}>
        <TestForm
          onSubmit={(test) => {
            setTest((tests) => tests.concat(test));
            onClose();
          }}
        />
      </Modal>
    </>
  );
}

import { useState } from "react";
import { CheckIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
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
  Box,
} from "@chakra-ui/react";

import { trpc } from "../utils/trpc";
import { useConfig } from "../utils/atoms";
import { ExamTestSchema } from "schooltalk-shared/misc";
import { TestForm } from "./TestForm";
import { format } from "date-fns";
import { ExamItem, ExamTest } from "schooltalk-shared/types";
interface ExamModalProps {
  examData?: Extract<ExamItem, { type: "exam" }>["item"];
  onSubmit: (name: string, tests: ExamTestSchema[]) => void;
  isSubmitting: boolean;
}

export default function ExamForm({
  examData,
  onSubmit,
  isSubmitting,
}: ExamModalProps) {
  const { schoolId: selectedSchoolId } = useConfig();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [textContent, setTextContent] = useState(examData?.name ?? "");

  const [selectedTests, setTest] = useState<ExamTestSchema[]>([]);

  const [currentTest, setCurrentTest] = useState<ExamTestSchema | null>(null);

  const [currentTestIndex, setCurrentTestIndex] = useState<number | null>(null);

  console.log(examData?.Tests, "examdata");

  return (
    <>
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{examData ? "Update" : "Create New"} Exam</Heading>
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
        <Heading size="md" mx={8} pb={4}>
          Tests
        </Heading>
        <>
          {selectedTests ? (
            selectedTests.map((test, index) => {
              return (
                <TestComponent
                  key={index}
                  test={test}
                  onEdit={() => {
                    setCurrentTest(test);
                    setCurrentTestIndex(index);
                    onOpen();
                  }}
                  onDelete={() => {
                    setTest((tests) => tests.filter((e, i) => i !== index));
                  }}
                />
              );
            })
          ) : (
            <Text>No Tests added</Text>
          )}
        </>
        <ModalFooter>
          <Flex justifyContent="center">
            <Button
              isLoading={isSubmitting}
              onClick={() => {
                if (selectedTests?.length > 0) {
                  onSubmit(textContent, selectedTests);
                } else {
                  console.log("Failes to save exam");
                }
              }}
            >
              <CheckIcon boxSize={"6"} />
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>

      <Modal isOpen={isOpen} onClose={onClose}>
        <TestForm
          testData={currentTest}
          onSubmit={(test) => {
            if (currentTest && typeof currentTestIndex === "number") {
              setTest((tests) => {
                tests.splice(currentTestIndex, 1, test);
                return tests;
              });
            } else {
              setTest((tests) => tests.concat(test));
            }
            setCurrentTest(null);
            setCurrentTestIndex(null);
            onClose();
          }}
        />
      </Modal>
    </>
  );
}

interface TestItemInterface {
  test: ExamTestSchema;
  onDelete?: () => void;
  onEdit?: () => void;
}

function TestComponent({ test, onEdit, onDelete }: TestItemInterface) {
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});
  const selectedSubjects = subjectsQuery.data
    ?.filter((obj) => test.subjectIds.includes(obj.id))
    .map((obj) => obj.name);

  return (
    <Box w="100%" borderTopWidth="1px" borderColor="gray" px={8} py={4}>
      <Flex justifyContent="space-between">
        <Flex alignItems="" flex="1" flexDir="column">
          <Text fontSize="lg" fontWeight="bold" mr="2">
            {selectedSubjects?.[0]}
            {selectedSubjects && selectedSubjects.length > 1
              ? ` & ${selectedSubjects.length - 1} more`
              : ""}
          </Text>

          <Text>
            {format(new Date(test.date_of_exam), "MMM dd, yyyy hh:mm aaa")}
          </Text>
        </Flex>
        <Flex alignItems="center" flexDir="column">
          <Text mr="2">{test.duration_minutes} minutes</Text>
          <Text>{test.total_marks} marks</Text>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" p="2" mt="2">
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<EditIcon />}
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          size="sm"
          colorScheme="red"
          borderColor="red"
          leftIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Delete
        </Button>
      </Flex>
    </Box>
  );
}

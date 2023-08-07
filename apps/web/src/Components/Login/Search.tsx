import { useState, useEffect } from "react";
import { trpc } from "../../utils/trpc";
import { SelectedSchoolIdAtom } from "../../utils/atoms";
import { useAtom } from "jotai";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  List,
  ListItem,
  Popover,
  Spinner,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

function useDebounce(value: string, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
interface props {
  setshowSchoolSelector: () => void;
}

export default function Search({ setshowSchoolSelector }: props) {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const { data, isFetching, isError } = trpc.school.schoolList.useQuery({
    search: debouncedSearch.toLowerCase(),
    page,
  });

  const [selectedSchoolId, updateSelectedSchool] =
    useAtom(SelectedSchoolIdAtom);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionSelect = (schoolId: string) => {
    updateSelectedSchool(schoolId);
    setshowSchoolSelector();
  };

  const selectedSchool = data?.schools.find((s) => s.id === selectedSchoolId);

  useEffect(() => {
    if (selectedSchool && !isDropdownOpen) setSearch(selectedSchool?.name);
  }, [selectedSchool?.name]);

  return (
    <Flex>
      <Stack>
        <Stack>
          <Heading fontSize={"4xl"}>Pick your desired school</Heading>
        </Stack>
        <Box
          w={["100%", "100%", "1/3"]}
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl id="school" w="100%">
              <Popover isLazy>
                <InputGroup>
                  <Input
                    placeholder="Your school!"
                    value={search}
                    mb={2}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setIsDropdownOpen(false), 500)
                    }
                  />
                  <InputRightElement>
                    {isFetching && <Spinner />}
                  </InputRightElement>
                </InputGroup>

                <Box maxHeight="150px" overflowY="auto">
                  <List styleType="none">
                    {data?.schools &&
                      data?.schools.map((item, index) => (
                        <ListItem key={index} m={2}>
                          <Link
                            onClick={() => handleOptionSelect(item.id)}
                            color="blue.500"
                          >
                            {item.name}
                          </Link>
                        </ListItem>
                      ))}
                  </List>
                </Box>
              </Popover>
            </FormControl>
            {selectedSchoolId && (
              <Button onClick={setshowSchoolSelector}>Go to Login</Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}

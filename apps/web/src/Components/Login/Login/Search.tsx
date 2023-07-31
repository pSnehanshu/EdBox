import { useState, useEffect } from "react";
import { trpc } from "../../../utils/trpc";

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
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

export default function Search() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching, isError } = trpc.school.schoolList.useQuery({
    search: debouncedSearch.toLowerCase(),
    page,
  });
  console.log(search, "search");
  console.log(data, isFetching, isError);
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
          {/* {isFetching && <Spinner />} */}
          <Stack spacing={4}>
            <FormControl id="school" w="100%">
              <DropDown
                search={search}
                setSearch={(e) => setSearch(e)}
                schools={data?.schools}
              />
            </FormControl>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}

type School = {
  id: string;
  name: string;
  website: string | null;
};
type DropDownParams = {
  search: string;
  setSearch: (searchText: string) => void;
  schools: School[] | undefined;
};

function DropDown({ search, setSearch, schools }: DropDownParams) {
  const [selectedOption, setSelectedOption] = useState<School | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionSelect = (option: School) => {
    setSelectedOption(option);
    console.log(option, "schoole");
    setSearch(option.name);
  };

  return (
    <Popover isLazy>
      <Input
        placeholder="Your school!"
        value={search ?? "Your school!"}
        mb={2}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setIsDropdownOpen(true)}
        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 500)}
      />
      <Box maxHeight="150px" overflowY="auto">
        <List styleType="none">
          {isDropdownOpen &&
            schools &&
            schools.map((item, index) => (
              <ListItem key={index} m={2}>
                <Link
                  onClick={() => {
                    handleOptionSelect(item);
                  }}
                  color="blue.500"
                >
                  {item.name}
                </Link>
              </ListItem>
            ))}
        </List>
      </Box>
    </Popover>
  );
}

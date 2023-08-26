import { useState, useEffect } from "react";
import { trpc } from "../../utils/trpc";
import {
  Box,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { ArrayElement, RouterOutput } from "schooltalk-shared/types";
import { env } from "../../utils/env";

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

type School = ArrayElement<RouterOutput["school"]["schoolList"]["schools"]>;

interface props {
  onSchoolSelected: (school: School) => void;
}

export default function Search({ onSchoolSelected }: props) {
  const [_search, setSearch] = useState<string>("");
  const search = useDebounce(_search, 500);

  const [page] = useState(1);
  const { data, isFetching } = trpc.school.schoolList.useQuery({
    search: search.toLowerCase(),
    page,
  });

  return (
    <Box p="4">
      <InputGroup mb="4">
        <Input
          placeholder="Search for your school..."
          value={_search}
          onChange={(e) => setSearch(e.target.value)}
          tabIndex={1}
        />
        <InputRightElement>
          {isFetching ? <Spinner /> : <SearchIcon />}
        </InputRightElement>
      </InputGroup>

      <List spacing="4" as="div">
        {data?.schools?.map((school, index) => (
          <ListItem
            key={school.id}
            as="button"
            role="listitem"
            display="flex"
            w="full"
            borderWidth={1}
            borderColor="transparent"
            cursor="pointer"
            p="2"
            borderRadius="8"
            _hover={{
              borderColor: "gray",
            }}
            onClick={() => onSchoolSelected(school)}
          >
            <Stack direction="row">
              <Image
                src={`${env.VITE_BACKEND_URL}/school-info/${school.id}/icon`}
                minH="50"
                minW="50"
                maxH="50"
                maxW="50"
              />
              <Text py="2" ml="4">
                {school.name}
              </Text>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

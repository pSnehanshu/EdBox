import { useState } from "react";
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
import { useDebounce } from "schooltalk-shared/useDebounce";
import { env } from "../../utils/env";

interface props {
  onSchoolSelected: (schoolId: string) => void;
}

export default function Search({ onSchoolSelected }: props) {
  const [_search, setSearch] = useState<string>("");
  const search = useDebounce(_search, 500);

  const [page] = useState(1);
  const { data, isFetching } = trpc.school.schoolList.useQuery({
    search: search.toLowerCase(),
    page,
  });

  const numOfResults = data?.schools.length ?? 0;

  return (
    <Box p="4">
      <Box mb="4">
        <InputGroup>
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

        {!isFetching && numOfResults < 1 && (
          <Text as="i" opacity={0.7}>
            No results for "{search}"
          </Text>
        )}
      </Box>

      <List spacing="4" as="div">
        {data?.schools?.map((school) => (
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
            onClick={() => onSchoolSelected(school.id)}
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

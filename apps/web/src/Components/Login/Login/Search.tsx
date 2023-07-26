import { useState, useEffect } from "react";
import { trpc } from "../../../utils/trpc";

import {
  FormControl,
  FormLabel,
  Input,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Stack,
  UnorderedList,
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
    <Stack spacing={4}>
      {isFetching && <Spinner />}
      <FormControl id="school" p={8} w="100%">
        <FormLabel>School</FormLabel>
        <DropDown setSearch={(e) => setSearch(e)} schools={data?.schools} />
      </FormControl>
    </Stack>
  );
}

type School = {
  id: string;
  name: string;
  website: string | null;
};
type DropDownParams = {
  setSearch: (searchText: string) => void;
  schools: School[] | undefined;
};

function DropDown({ setSearch, schools }: DropDownParams) {
  const [selectedOption, setSelectedOption] = useState("");
  const handleOptionSelect = (option: any) => {
    setSelectedOption(option);
  };

  return (
    <Popover isLazy>
      <Input
        placeholder="Click me!"
        onChange={(e) => setSearch(e.target.value)}
      />

      <UnorderedList>
        {schools &&
          schools.map((item, index) => (
            <ListItem key={index}>{item.name}</ListItem>
          ))}
      </UnorderedList>
    </Popover>
  );
}

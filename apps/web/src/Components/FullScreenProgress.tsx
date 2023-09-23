import { CircularProgress, Flex } from "@chakra-ui/react";

export default function FullScreenProgress() {
  return (
    <Flex h="100vh" justifyContent="center" alignItems="center">
      <CircularProgress isIndeterminate size="120px" />
    </Flex>
  );
}

import { Flex, Link, Image } from "@chakra-ui/react";
import svg from "../assets/images/404.svg";

export default function NotFound() {
  return (
    <Flex flexDirection="column" alignItems="center">
      <Image src={svg} width="80%" maxH="80vh" />

      {/* Mandatory attribution for free users */}
      <Link
        href="https://storyset.com/web"
        target="_blank"
        fontSize={"sm"}
        opacity={"0.5"}
      >
        Web illustrations by Storyset
      </Link>
    </Flex>
  );
}

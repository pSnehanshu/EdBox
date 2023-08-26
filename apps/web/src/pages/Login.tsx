import LoginOTP from "../Components/Login/LoginOTP";
import StudentLogin from "../Components/Login/LoginStudent";
import SchoolSelector from "../Components/Login/SchoolSelector";
import {
  useToast,
  Grid,
  GridItem,
  Box,
  Image,
  Heading,
  Flex,
  Button,
} from "@chakra-ui/react";
import Lottie from "lottie-react";
import loginPageAnimation from "../assets/lottie/login-page-animation.json";
import { useConfig, useConfigUpdate } from "../utils/atoms";
import { trpc } from "../utils/trpc";
import FullScreenProgress from "../Components/FullScreenProgress";
import { env } from "../utils/env";

export default function LoginPage() {
  const { schoolId } = useConfig();
  const setConfig = useConfigUpdate();

  const schoolInfoQuery = trpc.school.schoolBasicInfo.useQuery(
    { schoolId },
    { enabled: !!schoolId },
  );

  const toast = useToast();

  const handleLogin = () => {
    toast({
      title: "Login succesfull",
      description: "You will be redirected in a moment...",
      status: "success",
    });
  };

  const handleLoginFailure = (reason: string) => {
    toast({
      title: "Something went wrong",
      description: reason,
      status: "error",
      duration: 1500,
    });
  };

  if (schoolInfoQuery.isFetching) return <FullScreenProgress />;
  if (schoolInfoQuery.isError) return <h1>Error!</h1>;

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        lg: "1fr 1fr",
      }}
      w="full"
      minH="100vh"
    >
      <GridItem>
        {schoolId ? (
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            h="full"
            pt="8"
          >
            <Image
              src={`${env.VITE_BACKEND_URL}/school-info/${schoolId}/icon`}
              minH="50"
              minW="50"
              maxH="50"
              maxW="50"
            />

            <Heading as="h1" my="2">
              Welcome back
            </Heading>

            <Heading as="h2" size="sm" my="2" textAlign="center">
              Log into {schoolInfoQuery.data?.name}
            </Heading>

            <Box m="4">
              <LoginOTP
                onLogin={handleLogin}
                onLoginFailed={handleLoginFailure}
              />
            </Box>

            <Button
              variant="outline"
              my="2"
              onClick={() => setConfig({ schoolId: "" })}
            >
              Change school
            </Button>
          </Flex>
        ) : (
          <SchoolSelector
            onSchoolSelected={(schoolId) => setConfig({ schoolId })}
          />
        )}
      </GridItem>
      <GridItem>
        <Flex
          as={Lottie}
          animationData={loginPageAnimation}
          alignItems="center"
          justifyContent="center"
          h={{
            base: "auto",
            lg: "100vh",
          }}
        />
      </GridItem>
    </Grid>
  );
}

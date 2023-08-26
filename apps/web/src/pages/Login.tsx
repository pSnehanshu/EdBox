import LoginOTP from "../Components/Login/LoginOTP";
import StudentLogin from "../Components/Login/LoginStudent";
import Search from "../Components/Login/Search";
import { useToast, Grid, GridItem } from "@chakra-ui/react";
import { useConfig, useConfigUpdate } from "../utils/atoms";

export default function LoginPage() {
  const { schoolId } = useConfig();
  const setConfig = useConfigUpdate();

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
        {!schoolId && (
          <Search
            onSchoolSelected={(school) => {
              setConfig({ schoolId: school.id });
            }}
          />
        )}
      </GridItem>
      <GridItem></GridItem>
    </Grid>
  );
}

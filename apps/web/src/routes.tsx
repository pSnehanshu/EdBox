import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import LoginPage from "./pages/Login";
import { useCurrentUser } from "./utils/atoms";
import Navbar from "./Components/Navbar";
import SideMenu from "./Components/SideMenu";
import HomePage from "./pages/HomePage";
import { Box, Flex } from "@chakra-ui/react";
import HomeworkPage from "./pages/HomeworkPage";
import FullScreenProgress from "./Components/FullScreenProgress";
import NotFound from "./pages/NotFound";

export default function Routes() {
  const { isLoggedIn, isLoading } = useCurrentUser();

  const isSidebarVisible = isLoggedIn;

  if (isLoading) return <FullScreenProgress />;
  return (
    <>
      <Router>
        <Navbar />
        <Flex>
          {isSidebarVisible && <SideMenu />}

          <Box ml={{ base: 0, md: isSidebarVisible ? 72 : 0 }} p="4" w="full">
            <Switch>
              <Route path="/login">
                {isLoggedIn ? <Redirect to="/" /> : <LoginPage />}
              </Route>
              <Route path="/homework">
                {isLoggedIn ? <HomeworkPage /> : <Redirect to="/login" />}
              </Route>
              <Route exact path="/">
                {isLoggedIn ? <HomePage /> : <Redirect to="/login" />}
              </Route>
              <Route path="*">
                <NotFound />
              </Route>
            </Switch>
          </Box>
        </Flex>
      </Router>
    </>
  );
}

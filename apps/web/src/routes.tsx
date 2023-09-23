import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useCurrentUser, useSelectDefaultRole } from "./utils/atoms";
import Navbar from "./Components/Navbar";
import SideMenu from "./Components/SideMenu";
import FullScreenProgress from "./Components/FullScreenProgress";
import { Grid, GridItem } from "@chakra-ui/react";
import LoginPage from "./pages/Login";
import HomePage from "./pages/HomePage";
import HomeworkPage from "./pages/HomeworkPage";
import NotFound from "./pages/NotFound";
import ExamPage from "./pages/Exampage";

export default function Routes() {
  // DO NOT EVER REMOVE THIS HOOK
  useSelectDefaultRole();

  const { isLoggedIn, isLoading } = useCurrentUser();

  if (isLoading) return <FullScreenProgress />;

  return (
    <Router>
      <Switch>
        <Route path="/login">
          {isLoggedIn ? <Redirect to="/" /> : <LoginPage />}
        </Route>

        <Route path="/">
          <Grid
            templateColumns="1fr 5fr"
            templateRows="1fr 11fr"
            h="100vh"
            w="100vw"
          >
            <GridItem gridRow="1/2" gridColumn="1/3">
              <Navbar />
            </GridItem>

            {isLoggedIn && (
              <GridItem
                gridRow="2/3"
                gridColumn="1/2"
                overflowY="auto"
                display={{
                  base: "none",
                  lg: "block",
                }}
              >
                <SideMenu />
              </GridItem>
            )}

            <GridItem
              gridRow="2/3"
              gridColumn={
                isLoggedIn
                  ? {
                      base: "1/3",
                      lg: "2/3",
                    }
                  : "1/3"
              }
              p="4"
              h="full"
              w="full"
              overflowY="scroll"
              overflowX="hidden"
            >
              <Switch>
                <Route path="/homework">
                  {isLoggedIn ? <HomeworkPage /> : <Redirect to="/login" />}
                </Route>

                <Route path="/exam">
                  {isLoggedIn ? <ExamPage /> : <Redirect to="/login" />}
                </Route>

                <Route exact path="/">
                  {isLoggedIn ? <HomePage /> : <Redirect to="/login" />}
                </Route>

                <Route path="*">
                  <NotFound />
                </Route>
              </Switch>
            </GridItem>
          </Grid>
        </Route>
      </Switch>
    </Router>
  );
}

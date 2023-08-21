import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Main from "./pages/Main";
import About from "./pages/About";
import LoginPage from "./pages/Login";
import { useCurrentUser } from "./utils/atoms";
import Navbar from "./Components/Navbar";
import SideMenu from "./Components/SideMenu";
import HomePage from "./pages/HomePage";
import { Flex } from "@chakra-ui/react";
import HomeworkPage from "./pages/HomeworkPage";
import FullScreenProgress from "./Components/FullScreenProgress";

export default function Routes() {
  const { isLoggedIn, isLoading } = useCurrentUser();

  if (isLoading) return <FullScreenProgress />;
  return (
    <>
      <Router>
        <Navbar />
        <Flex>
          {isLoggedIn && <SideMenu />}

          <Switch>
            <Route path="/about">
              {isLoggedIn ? <About /> : <Redirect to="/login" />}
            </Route>
            <Route path="/login">
              {isLoggedIn ? <Redirect to="/" /> : <LoginPage />}
            </Route>
            <Route path="/home">
              {isLoggedIn ? <HomePage /> : <Redirect to="/login" />}
            </Route>
            <Route path="/homework">
              {isLoggedIn ? <HomeworkPage /> : <Redirect to="/login" />}
            </Route>
            <Route path="/">
              {isLoggedIn ? <Main /> : <Redirect to="/login" />}
            </Route>
          </Switch>
        </Flex>
      </Router>
    </>
  );
}

import { lazy } from "react";
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
import NotFound from "./pages/NotFound";

const LoginPage = lazy(() => import("./pages/Login"));
const HomePage = lazy(() => import("./pages/HomePage"));
const HomeworkPage = lazy(() => import("./pages/HomeworkPage"));

export default function Routes() {
  // DO NOT EVER REMOVE THIS HOOK
  useSelectDefaultRole();

  const { isLoggedIn, isLoading } = useCurrentUser();

  if (isLoading) return <FullScreenProgress />;
  return (
    <Router>
      {isLoggedIn && <Navbar />}
      {isLoggedIn && <SideMenu />}

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
    </Router>
  );
}

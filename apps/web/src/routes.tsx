import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Main from "./pages/Main";
import About from "./pages/About";
import LoginPage from "./pages/Login";
import { useAtomValue } from "jotai";
import { IsLoggedInAtom } from "./utils/atoms";

export default function Routes() {
  const isLoggedIn = useAtomValue(IsLoggedInAtom);

  return (
    <Router>
      <Switch>
        <Route path="/about">
          {isLoggedIn ? <About /> : <Redirect to="/login" />}
        </Route>
        <Route path="/login">
          {isLoggedIn ? <Redirect to="/" /> : <LoginPage />}
        </Route>
        <Route path="/">
          {isLoggedIn ? <Main /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </Router>
  );
}
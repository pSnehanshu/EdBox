import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Main from "./pages/Main";
import About from "./pages/About";
import LoginPage from "./pages/Login";

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/">
          <Main />
        </Route>
      </Switch>
    </Router>
  );
}

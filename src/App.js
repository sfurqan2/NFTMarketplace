import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { CreateItem, Home, Profile } from "./pages";

function App() {
  
  return (
    <Router>
      <div>
        <nav>

          <h1>NFT Marketplace</h1>
          <ul className="flex w-64 justify-around py-5">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/create-item">About</Link>
            </li>
            <li>
              <Link to="/profile">Users</Link>
            </li>
          </ul>
        </nav>

        
        <Switch>
          <Route path="/create-item">
            <CreateItem />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

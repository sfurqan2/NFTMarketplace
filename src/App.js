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
      <div className="container max-w-xl sm:max-w-2xl md:max-w-4xl xl:max-w-7xl m-auto min-h-screen flex flex-col">
        <nav className="flex justify-between items-center">

          <h1 className="text-2xl font-semibold">NFT Marketplace</h1>
          <ul className="flex w-96 justify-around py-5">
            <li>
              <Link to="/" className="text-blue-400 hover:text-blue-600 transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/create-item" className="text-blue-400 hover:text-blue-600 transition-colors">Add Item to Marketplace</Link>
            </li>
            <li>
              <Link to="/profile" className="text-blue-400 hover:text-blue-600 transition-colors">Profile</Link>
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

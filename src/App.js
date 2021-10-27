import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { CreateItem, Home, Profile, History } from "./pages";

function App() {
  const [addr, setAddr] = useState("");
  const ethereum = window.ethereum;
  
  if(ethereum){
    ethereum.on('accountsChanged', (accounts) => {
      setAddr(accounts[0]);
    })
  }

  useEffect(() => {
    if(!addr) setAddr(ethereum.selectedAddress);
  }, []);

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
            <li>
              <Link to="/history" className="text-blue-400 hover:text-blue-600 transition-colors">History</Link>
            </li>
          </ul>
        </nav>

        
        <Switch>
          <Route path="/history">
            <History address={addr} />
          </Route>
          <Route path="/create-item">
            <CreateItem address={addr} />
          </Route>
          <Route path="/profile">
            <Profile address={addr} />
          </Route>
          <Route path="/">
            <Home address={addr} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

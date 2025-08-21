import React from "react";
import { Routes, Route, Navigate } from "react-router";
import Home from "./Pages/Home";
import Match from "./Pages/match";
import Call from "./Pages/Call";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
const App = () => {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/signup" element={<Signup/>} />
          <Route path="/login" element={<Login/>} />
        <Route path="/match" element={<Match />} />
        <Route path="/call/:callId" element={<Call />} />
      </Routes>
   
  );
};

export default App;
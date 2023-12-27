import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddListing from "./pages/AddListing";

function App() {

  


  return (
    <div>
    <Router>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-listing" element={<AddListing />} />
        
      </Routes>
      
    </Router>
  </div>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Properties from './components/Properties';
import PropertyDetail from './components/PropertyDetail';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* De lijstweergave */}
          <Route path="/" element={<Properties />} />
          
          {/* De detailweergave */}
          <Route path="/property/:id" element={<PropertyDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
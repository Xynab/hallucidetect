import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar'; // ✅ fixed path
import { Home } from './pages/Home';
import { History } from './pages/History';
import ResultView from './pages/ResultView';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/result/:id" element={<ResultView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
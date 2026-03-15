import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './routes/ChatPage';
import OrgChartPage from './routes/OrgChartPage';
import DashboardPage from './routes/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/org-chart" element={<OrgChartPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

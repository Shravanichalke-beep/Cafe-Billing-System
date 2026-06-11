import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import POS from './pages/POS';
import Bills from './pages/Bills';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tables" element={<PrivateRoute><Tables /></PrivateRoute>} />
        <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
        <Route path="/pos/:tableId?" element={<PrivateRoute><POS /></PrivateRoute>} />
        <Route path="/bills" element={<PrivateRoute><Bills /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

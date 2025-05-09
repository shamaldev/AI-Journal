import React,{useEffect,useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation,useNavigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Chat from './components/Chat';
import { FaUserCircle } from 'react-icons/fa';
import './App.css';
import checkToken from './checkToken';
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userId'));
  const username = localStorage.getItem("username");
  const token = localStorage.getItem('token');
  // Update login state on route change
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('userId'));
  }, [location]);

  useEffect(() => {

    const checkTokenExpired = () => {
      console.log('check')
      if (token && checkToken(token)) {
        console.log('Token expired. Logging out.');
        handleLogout();
      }
    };

    checkTokenExpired(); // Check on component mount

    // Optional: Set up an interval to check periodically (e.g., every minute)
    const intervalId = setInterval(checkTokenExpired, 60000); // 60000 milliseconds = 1 minute

   
    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, [token,navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username'); // Remove username if stored
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>My Journal AI</h1>
        <nav>
          <ul>
            {isLoggedIn ? (
              <>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
  <FaUserCircle size={20} />
  <span>{username}</span>
</li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/login">Log In</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          {/* Add other routes here */}
        </Routes>
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} My Journal AI</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

import './index.css';
import './theme.css';
import Header from './components/Header';
import Footer from './components/Footer';
import AppRouter from './router/AppRouter';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div
        style={{
          backgroundImage: 'url("/background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <main style={{ flex: "1" }}>
          <AppRouter />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

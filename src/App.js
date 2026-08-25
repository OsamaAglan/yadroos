import AppRouter from './router/AppRouter';

function App() {
 
  


return (
    <div
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
      }}
    >
      
      {<AppRouter />}
    </div>
  );}

export default App;

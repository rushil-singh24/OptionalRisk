/** Top-level app component rendering the dashboard shell. */
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>Options Risk Analysis</h1>
        <p className="placeholder">
          Placeholder UI for building portfolio analytics and risk simulations.
        </p>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;

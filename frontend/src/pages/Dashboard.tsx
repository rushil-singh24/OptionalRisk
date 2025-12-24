/** Dashboard page placeholder for portfolio inputs, summary, and charts. */
import GreeksChart from "../components/GreeksChart";
import PortfolioSummary from "../components/PortfolioSummary";
import PositionForm from "../components/PositionForm";

const Dashboard = () => {
  return (
    <main className="grid">
      <section className="card">
        <h2 className="section-title">Portfolio Input</h2>
        <PositionForm />
      </section>

      <section className="card">
        <h2 className="section-title">Portfolio Summary</h2>
        <PortfolioSummary />
      </section>

      <section className="card">
        <h2 className="section-title">Greeks Overview</h2>
        <GreeksChart />
      </section>
    </main>
  );
};

export default Dashboard;

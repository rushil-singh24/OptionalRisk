import React, { useState } from "react";

interface Props {
  portfolio: any[];
  setPortfolio: (p: any[]) => void;
  defaultVolatility: number;
}

const PositionForm: React.FC<Props> = ({ portfolio, setPortfolio, defaultVolatility }) => {
  const [position, setPosition] = useState({
    type: "call",
    side: "long",
    quantity: 1,
    strike: 100,
    time_to_expiry: 0.5,
    volatility: defaultVolatility
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPosition({ ...position, [name]: name === "quantity" || name === "strike" || name === "time_to_expiry" || name === "volatility" ? parseFloat(value) : value });
  };

  const addPosition = () => {
    setPortfolio([...portfolio, position]);
    setPosition({
      type: "call",
      side: "long",
      quantity: 1,
      strike: 100,
      time_to_expiry: 0.5,
      volatility: defaultVolatility
    });
  };

  return (
    <div>
      <select name="type" value={position.type} onChange={handleChange}>
        <option value="call">Call</option>
        <option value="put">Put</option>
      </select>

      <select name="side" value={position.side} onChange={handleChange}>
        <option value="long">Long</option>
        <option value="short">Short</option>
      </select>

      <input type="number" name="quantity" value={position.quantity} onChange={handleChange} placeholder="Quantity" />
      <input type="number" name="strike" value={position.strike} onChange={handleChange} placeholder="Strike Price" />
      <input type="number" step="0.01" name="time_to_expiry" value={position.time_to_expiry} onChange={handleChange} placeholder="Time to Expiry (years)" />
      <input type="number" step="0.01" name="volatility" value={position.volatility} onChange={handleChange} placeholder="Volatility" />

      <button onClick={addPosition}>Add Position</button>

      <h3>Current Portfolio:</h3>
      <pre>{JSON.stringify(portfolio, null, 2)}</pre>
    </div>
  );
};

export default PositionForm;

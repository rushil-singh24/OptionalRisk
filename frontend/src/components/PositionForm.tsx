/** Placeholder component for entering portfolio positions. */
import { useState } from "react";

type Position = {
  symbol: string;
  quantity: number;
  type: "call" | "put" | "";
};

const PositionForm = () => {
  const [positions, setPositions] = useState<Position[]>([
    { symbol: "", quantity: 0, type: "" },
  ]);

  const addRow = () =>
    setPositions((prev) => [...prev, { symbol: "", quantity: 0, type: "" }]);

  return (
    <div>
      <p className="placeholder">
        Capture option positions here; wire this up to backend analytics later.
      </p>
      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {positions.map((pos, idx) => (
          <div key={idx} className="card" style={{ padding: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Symbol"
                value={pos.symbol}
                onChange={(e) =>
                  setPositions((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, symbol: e.target.value } : p))
                  )
                }
              />
              <input
                type="number"
                placeholder="Quantity"
                value={pos.quantity}
                onChange={(e) =>
                  setPositions((prev) =>
                    prev.map((p, i) =>
                      i === idx ? { ...p, quantity: Number(e.target.value) } : p
                    )
                  )
                }
              />
              <select
                value={pos.type}
                onChange={(e) =>
                  setPositions((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, type: e.target.value as Position["type"] } : p))
                  )
                }
              >
                <option value="">Type</option>
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addRow} style={{ marginTop: "0.75rem" }}>
        Add Position
      </button>
    </div>
  );
};

export default PositionForm;

import React, { useState } from "react";

interface Props {
  shouldThrow?: boolean;
}

export function ErrorTestComponent({ shouldThrow = false }: Props) {
  const [count, setCount] = useState(0);

  if (shouldThrow) {
    throw new Error("This is a test error to demonstrate the error boundary!");
  }

  return (
    <div className="card">
      <h3>Error Boundary Test Component</h3>
      <p>This component can be used to test error boundaries.</p>
      <p>Count: {count}</p>
      <div className="row">
        <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
    </div>
  );
}

// Hook to simulate errors in functional components
export function useErrorSimulator() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Hook-based error simulation!");
  }

  return {
    triggerError: () => setShouldThrow(true),
    reset: () => setShouldThrow(false),
  };
}

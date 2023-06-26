import { trpc } from "./utils/trpc";
import "./App.css";

export default function App() {
  const { data, isLoading } = trpc.health.useQuery();

  return (
    <>
      <div>
        <p>Yo!</p>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </>
  );
}

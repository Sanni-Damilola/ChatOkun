import io from "socket.io-client";

function App() {
  const url = "http://localhost:8899";

  const socket: any = io(url);

  return (
    <>
      <div>App</div>
    </>
  );
}

export default App;

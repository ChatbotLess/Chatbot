import { Sidebar } from "../components/Sidebar"
import { Chat } from "./Chat"

function App() {
  return (
    <div className="flex h-[100vh] bg-gray-950">
      <Sidebar/>
      <Chat/>
    </div>
  )
}

export default App

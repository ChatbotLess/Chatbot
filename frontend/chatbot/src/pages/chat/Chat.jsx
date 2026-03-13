import { ChatArea1 } from "../../components/chat/ChatArea1"
import { ChatArea2 } from "../../components/chat/ChatArea2"
import { useSearchParams } from 'react-router-dom'




export function Chat() {

  const [searchParams] = useSearchParams();
  const idChat = searchParams.get("idChat");

  return (
    <div className={`flex bg-gray-950 justify-center ${idChat ? "h-[95vh] items-end" : "h-[100vh] items-center"}`}>
      {idChat ? <ChatArea2/> : <ChatArea1 />} 

    </div>
  )
}



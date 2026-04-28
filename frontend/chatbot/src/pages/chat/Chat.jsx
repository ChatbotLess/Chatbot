import { ChatArea2 } from "../../components/chat/ChatArea2"
import { useParams } from 'react-router-dom';

export function Chat() {
  const { conversationId } = useParams();

  return (
    <div className="flex h-screen justify-center bg-gray-950">
      <ChatArea2 conversationId={conversationId}/>
    </div>
  )
}



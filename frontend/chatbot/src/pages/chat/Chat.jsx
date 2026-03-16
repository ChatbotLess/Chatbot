import { ChatArea2 } from "../../components/chat/ChatArea2"
import { useParams } from 'react-router-dom';

export function Chat() {
  const { conversationId } = useParams();

  return (
    <div className={"flex bg-gray-950 justify-center h-[95vh] items-end"}>
      <ChatArea2 conversationId={conversationId}/>
    </div>
  )
}



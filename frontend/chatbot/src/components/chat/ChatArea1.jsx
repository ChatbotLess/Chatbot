import { Promptbar } from "../Promptbar"
import { MdOutlineMessage } from "react-icons/md";


export function ChatArea1() {
  return (
    <div className="flex flex-col w-full justify-center items-center ">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MdOutlineMessage className="text-white text-6xl" />
          <h1 className="text-white text-6xl font-bold">CHATBOT</h1>
        </div>
        <p className="text-white text-lg text-center opacity-80">
          Seu assistente inteligente para respostas rápidas e precisas
        </p>
      </div>
      <div className="w-full max-w-[700px] px-4">
        <Promptbar/>
      </div>
    </div>
  )
}
import { Promptbar } from "../Promptbar"
import { MdOutlineMessage } from "react-icons/md";


export function ChatArea1() {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center justify-center">
      <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
        <div className="mb-2 flex flex-col items-center gap-2 xs:flex-row xs:gap-3">
          <MdOutlineMessage className="text-5xl text-white sm:text-6xl" />
          <h1 className="text-4xl font-bold text-white xs:text-5xl sm:text-6xl">CHATBOT</h1>
        </div>
        <p className="max-w-[28rem] text-sm text-white/80 xs:text-base sm:text-lg">
          Seu assistente inteligente para respostas rápidas e precisas
        </p>
      </div>
      <div className="w-full max-w-[700px]">
        <Promptbar/>
      </div>
    </div>
  )
}

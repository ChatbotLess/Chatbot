import { ResetPassEmail } from '../../components/resetPassword/ResetPassEmail'
import { MdOutlineMessage } from "react-icons/md";

export function ResetPassPage() {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <header className="flex items-center gap-3 mb-8">
        <MdOutlineMessage className="text-4xl text-gray-950" />
        <h1 className="text-4xl font-bold text-gray-950">Chatbot</h1>
      </header>
      <ResetPassEmail />
    </div>

  )
}
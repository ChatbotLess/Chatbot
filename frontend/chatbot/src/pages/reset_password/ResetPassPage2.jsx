import { ResetPassForm } from '../../components/resetPassword/ResetPassForm'
import { MdOutlineMessage } from "react-icons/md";

export function ResetPassPage2() {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <header className="flex items-center gap-3 mb-8">
        <MdOutlineMessage className="text-4xl text-white" />
        <h1 className="text-4xl font-bold text-white">Chatbot</h1>
      </header>
      <ResetPassForm />
    </div>

  )
}
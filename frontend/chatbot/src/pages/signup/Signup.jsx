import { SignupForm } from '../../components/signup/SignupForm'
import { MdOutlineMessage } from "react-icons/md";

export function Signup() {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-4 py-8">
      <header className="mb-6 flex items-center gap-3 md:mb-8">
        <MdOutlineMessage className="text-3xl text-white xs:text-4xl" />
        <h1 className="text-3xl font-bold text-white xs:text-4xl">Chatbot</h1>
      </header>
      <SignupForm />
    </div>

  )
}

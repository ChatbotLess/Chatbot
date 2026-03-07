import { TbSend } from "react-icons/tb";

export function Promptbar() {
  return (
    <form className="w-full">
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 gap-2">

        <input
          type="text"
          placeholder="Olá, como posso te ajudar?"
          className="flex bg-transparent outline-none text-gray-200 placeholder-gray-400 w-[100%]"
        />

        <button className="p-2 rounded-lg hover:bg-gray-700 transition">
          <TbSend size={20} className="text-gray-300" />
        </button>

      </div>
    </form>
  )
}
import { FaUser, FaEllipsisV, FaPlus, FaFileUpload, FaChartBar } from "react-icons/fa";
import { MdOutlineMessage } from "react-icons/md";
import { useNavigate } from "react-router-dom";


export function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="flex flex-col justify-between h-screen w-64 bg-gray-900 text-gray-200 p-4 rounded-r-lg">

      <header className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/')}>
        <MdOutlineMessage className="text-2xl text-white" />
        <h1 className="text-2xl font-bold text-white">Chatbot</h1>
      </header>

      <div className="flex flex-col gap-2">
        <button className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded transition" onClick={() => navigate('/')}>
          <FaPlus />
          Nova Conversa
        </button>

        <button className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded transition">
          <FaFileUpload />
          Inserir Documentos
        </button>

        <button className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded transition">
          <FaChartBar />
          Dashboard
        </button>
      </div>

      <div className="mt-6 flex-1">
        <h3 className="font-semibold mb-2 text-gray-400">
          Histórico de conversa:
        </h3>
        {/* FAZER O MAP DOS CHAT DO BANCO */}
      </div>

      <footer className="flex items-center gap-3 border border-gray-700 rounded-lg p-3 mt-4 hover:bg-gray-800 transition">
        <FaUser size={24} className="text-gray-300" />

        <div className="flex flex-col flex-1">
          <span className="font-medium text-white">
            DHIONATAM {/* NOME DO USUARIO DO BANCO */}
          </span>

          <span className="text-sm text-gray-400">
            (ADMIN) {/* CARGO DO BANCO */}
          </span>
        </div>

        <button className="cursor-pointer text-gray-400 hover:text-white">
          <FaEllipsisV />
        </button>
      </footer>

    </aside>
  );
}
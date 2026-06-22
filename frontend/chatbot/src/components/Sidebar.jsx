import { useContext } from "react";
import {
  FaChartBar,
  FaDatabase,
  FaEllipsisV,
  FaFileUpload,
  FaPlus,
  FaUser,
} from "react-icons/fa";
import { MdLogout, MdOutlineMessage } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider/AuthProvider";
import { useChatData } from "../hooks/useChatData";

export function Sidebar() {
  const { logOut, user } = useContext(AuthContext);
  const { data, isError, isLoading } = useChatData(!!user);
  const navigate = useNavigate();
  const location = useLocation();
  const userName = user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const getNavButtonClass = (path) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
      location.pathname === path
        ? "bg-blue-600/20 text-white ring-1 ring-blue-500/40"
        : "hover:bg-gray-800 hover:text-white"
    }`;
  const getNavIconClass = (path) =>
    `shrink-0 ${location.pathname === path ? "text-blue-300" : "text-gray-400"}`;

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside className="flex h-screen w-[min(18rem,85vw)] shrink-0 flex-col overflow-hidden rounded-r-lg border-r border-gray-800 bg-gray-900 px-3 py-4 text-gray-200 shadow-xl shadow-black/20" data-cy="sidebar">
      <div className="shrink-0">
        <header
          className="mb-6 flex cursor-pointer items-center gap-2 px-1 transition hover:opacity-80"
          onClick={() => navigate("/")}
        >
          <MdOutlineMessage className="text-2xl text-white" />
          <h1 className="text-2xl font-bold text-white">Chatbot</h1>
        </header>

        <nav className="flex flex-col gap-1">
          <button
            className={getNavButtonClass("/")}
            data-cy="sidebar-new-chat"
            onClick={() => navigate("/")}
          >
            <FaPlus className={getNavIconClass("/")} />
            Nova Conversa
          </button>

          <button
            className={getNavButtonClass("/upload")}
            data-cy="sidebar-upload"
            onClick={() => navigate("/upload")}
          >
            <FaFileUpload className={getNavIconClass("/upload")} />
            Inserir Documentos
          </button>

          <button
            className={getNavButtonClass("/base-conhecimento")}
            data-cy="sidebar-knowledge-base"
            onClick={() => navigate("/base-conhecimento")}
          >
            <FaDatabase className={getNavIconClass("/base-conhecimento")} />
            Base de Conhecimento
          </button>

          <button
            className={getNavButtonClass("/dashboard")}
            data-cy="sidebar-dashboard"
            onClick={() => navigate("/dashboard")}
          >
            <FaChartBar className={getNavIconClass("/dashboard")} />
            Dashboard
          </button>
        </nav>
      </div>

      <section className="mt-6 flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Historico de conversa
          </h3>
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            <span className="sr-only">Total de conversas: </span>
            {data?.length ?? 0}
          </span>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading && (
            <div className="rounded-md border border-gray-800 bg-gray-950/60 px-3 py-2 text-sm text-gray-500">
              Carregando conversas...
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              Nao foi possivel carregar o historico.
            </div>
          )}

          {!isLoading && !isError && data?.length === 0 && (
            <div className="rounded-md border border-dashed border-gray-700 px-3 py-4 text-center text-sm text-gray-500">
              Nenhuma conversa ainda.
            </div>
          )}

          {data?.map((chat) => {
            const isActive = location.pathname === `/chat/${chat.id}`;

            return (
              <button
                key={chat.id}
                data-cy="chat-history-item"
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? "bg-blue-600/20 text-white ring-1 ring-blue-500/40"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                <MdOutlineMessage
                  className={`shrink-0 ${
                    isActive ? "text-blue-300" : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />
                <span className="min-w-0 flex-1 truncate">
                  {chat.titulo || "Conversa sem titulo"}
                </span>
                <FaEllipsisV className="shrink-0 text-xs text-gray-600 opacity-0 transition group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </section>

      <footer className="mt-4 flex shrink-0 items-center gap-3 rounded-lg border border-gray-700 bg-gray-950/50 p-3 transition hover:bg-gray-800">
        <FaUser size={24} className="shrink-0 text-gray-300" />

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium uppercase text-white">{userName}</span>

          <span className="text-sm text-gray-400">
            (ADMIN) {/* CARGO DO BANCO */}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="cursor-pointer rounded-md p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white"
          data-cy="logout-button"
          title="Sair"
          type="button"
        >
          <MdLogout />
        </button>
      </footer>
    </aside>
  );
}

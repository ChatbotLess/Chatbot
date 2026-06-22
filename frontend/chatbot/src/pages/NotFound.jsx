import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <p className="text-2xl font-semibold text-gray-600 mt-4">
          Página não encontrada
        </p>
        <p className="text-gray-500 mt-2">
          A página que você está procurando não existe.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 px-6 py-3 bg-ifes-green-600 hover:bg-ifes-green-500 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60"
        >
          Voltar para o início
        </button>
      </div>
    </div>
  );
}

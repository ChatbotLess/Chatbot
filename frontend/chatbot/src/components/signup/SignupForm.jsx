import { useNavigate } from "react-router-dom";


export function SignupForm() {
    const navigate = useNavigate();
    return (
        <div className="bg-gray-900 rounded-lg p-10 shadow-xl w-full max-w-md">

            <form action="" className="space-y-5">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Cadastrar</h1>
                </header>

                <div className="space-y-2">
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-300">
                        Nome:
                    </label>
                    <input 
                        type="text" 
                        name="nome" 
                        id="nome" 
                        placeholder="Escreva seu nome" 
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                    />
                </div>

                
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email:
                    </label>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        placeholder="Escreva seu email" 
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="senha" className="block text-sm font-medium text-gray-300">
                        Senha:
                    </label>
                    <input 
                        type="password" 
                        name="senha" 
                        id="senha" 
                        placeholder="Escreva sua senha" 
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="senha" className="block text-sm font-medium text-gray-300">
                        Escreva a sua senha novamente:
                    </label>
                    <input 
                        type="password" 
                        name="senha" 
                        id="senha" 
                        placeholder="Escreva sua senha" 
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                    />
                </div>
            </form>

            <footer className="mt-6 space-y-5">
                <button 
                    type="submit" 
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    Cadastar-se
                </button>
                <button 
                    type="submit" 
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900" onClick={() => navigate('/login')}
                >
                    Voltar
                </button>
            </footer>
        </div>
    )
}
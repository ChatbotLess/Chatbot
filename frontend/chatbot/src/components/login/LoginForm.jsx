import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider/AuthProvider";
import { useForm } from 'react-hook-form';

export function LoginForm() {
    const { register, handleSubmit } = useForm();
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (data) => {
        setIsLoading(true);

        try {
            await loginUser(data.email, data.senha);
            navigate("/");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg p-10 shadow-xl w-full max-w-md" data-cy="login-card">

            <form className="space-y-5" onSubmit={handleSubmit(handleLogin)} data-cy="login-form">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-white">LOGIN</h1>
                </header>

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email:
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Escreva seu email"
                        data-cy="login-email"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                        {...register('email', { required: true })}
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
                        data-cy="login-password"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                        {...register('senha', { required: true })}
                    />
                </div>

                <div>
                    <p className="cursor-pointer text-gray-200" data-cy="forgot-password-link" onClick={() => navigate('/reset')}>Esqueci minha senha</p>
                </div>

                <footer className="mt-6 space-y-5">
                    <button
                        type="submit"
                        disabled={isLoading}
                        data-cy="login-submit"
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>
                    <button
                        type="button"
                        data-cy="signup-link"
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                        onClick={() => navigate('/signup')}
                    >
                        Cadastrar-se
                    </button>
                </footer>
            </form>

        </div>
    )
}

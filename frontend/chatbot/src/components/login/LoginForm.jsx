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
        <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl xs:p-6 md:p-10" data-cy="login-card">

            <form className="space-y-5" onSubmit={handleSubmit(handleLogin)} data-cy="login-form">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-950">LOGIN</h1>
                </header>

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email:
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Escreva seu email"
                        data-cy="login-email"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:border-transparent transition-all"
                        {...register('email', { required: true })}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                        Senha:
                    </label>
                    <input
                        type="password"
                        name="senha"
                        id="senha"
                        placeholder="Escreva sua senha"
                        data-cy="login-password"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:border-transparent transition-all"
                        {...register('senha', { required: true })}
                    />
                </div>

                <div>
                    <button
                        type="button"
                        className="text-sm text-gray-800 underline-offset-4 transition hover:text-gray-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60"
                        data-cy="forgot-password-link"
                        onClick={() => navigate('/reset')}
                    >
                        Esqueci minha senha
                    </button>
                </div>

                <footer className="mt-6 space-y-5">
                    <button
                        type="submit"
                        disabled={isLoading}
                        data-cy="login-submit"
                        className="w-full px-4 py-3 bg-ifes-green-600 hover:bg-ifes-green-500 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>
                    <button
                        type="button"
                        data-cy="signup-link"
                        className="w-full px-4 py-3 bg-ifes-green-600 hover:bg-ifes-green-500 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:ring-offset-2 focus:ring-offset-white"
                        onClick={() => navigate('/signup')}
                    >
                        Cadastrar-se
                    </button>
                </footer>
            </form>

        </div>
    )
}

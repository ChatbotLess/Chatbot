import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { updateProfile } from "firebase/auth";
import { AuthContext } from "../../context/AuthProvider/AuthProvider";
import { useForm } from 'react-hook-form';

const isE2EAuthEnabled = import.meta.env.VITE_E2E_AUTH === "true";

export function SignupForm() {
    const { register, handleSubmit, watch } = useForm();
    const { createUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (data) => {
        setIsLoading(true);

        try {
            const credential = await createUser(data.email, data.senha);

            if (!isE2EAuthEnabled) {
                await updateProfile(credential.user, { displayName: data.nome });
                await credential.user.getIdToken(true);
            }
            
            navigate("/login");
        } catch (error) {
            console.error("Error code:", error.code, "Error message:", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl xs:p-6 md:p-10" data-cy="signup-card">

            <form className="space-y-5" onSubmit={handleSubmit(handleSignup)} data-cy="signup-form">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-950">Cadastrar</h1>
                </header>

                <div className="space-y-2">
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                        Nome:
                    </label>
                    <input
                        type="text"
                        name="nome"
                        id="nome"
                        placeholder="Escreva seu nome"
                        data-cy="signup-name"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:border-transparent transition-all"
                        {...register('nome', { required: true })}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email:
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Escreva seu email"
                        data-cy="signup-email"
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
                        data-cy="signup-password"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:border-transparent transition-all"
                        {...register('senha', {
                            required: "Senha obrigatória",
                            minLength: {
                                value: 6,
                                message: "Mínimo 6 caracteres"
                            }
                        })}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="senha2" className="block text-sm font-medium text-gray-700">
                        Escreva a sua senha novamente:
                    </label>
                    <input
                        type="password"
                        name="senha2"
                        id="senha2"
                        placeholder="Escreva sua senha"
                        data-cy="signup-confirm-password"
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:border-transparent transition-all"
                        {...register('senha2', {
                            required: "Confirme sua senha",
                            validate: (value) =>
                                value === watch('senha') || "As senhas não coincidem"
                        })}
                    />
                </div>

                <footer className="mt-6 space-y-5">
                    <button
                        type="submit"
                        disabled={isLoading}
                        data-cy="signup-submit"
                        className="w-full px-4 py-3 bg-ifes-green-600 hover:bg-ifes-green-500 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Cadastrando..." : "Cadastrar-se"}
                    </button>
                    <button
                        type="button"
                        data-cy="signup-back"
                        className="w-full px-4 py-3 bg-ifes-green-600 hover:bg-ifes-green-500 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:ring-offset-2 focus:ring-offset-white"
                        onClick={() => navigate('/login')}
                    >
                        Voltar
                    </button>
                </footer>
            </form>
        </div>
    )
}

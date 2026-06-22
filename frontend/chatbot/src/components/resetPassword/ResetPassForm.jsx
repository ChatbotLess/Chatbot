import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider/AuthProvider";
import { useForm } from 'react-hook-form';
import { useSearchParams } from "react-router-dom";

export function ResetPassForm() {
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get("oobCode");

    const { register, handleSubmit, watch } = useForm();
    const { confirmPassword } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (data) => {
        setIsLoading(true);

        try {
            await confirmPassword(oobCode, data.senha);
        } catch (error) {
            console.error("Error code:", error.code, "Error message:", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-lg p-10 shadow-xl w-full max-w-md" data-cy="reset-password-card">

            <form className="space-y-5" onSubmit={handleSubmit(handleSignup)} data-cy="reset-password-form">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-950">Alterar Senha</h1>
                </header>

                <div className="space-y-2">
                    <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                        Senha:
                    </label>
                    <input
                        type="password"
                        name="senha"
                        id="senha"
                        placeholder="Escreva sua senha"
                        data-cy="reset-password-input"
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
                        data-cy="reset-confirm-password-input"
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
                        data-cy="reset-password-submit"
                        className="w-full px-4 py-3 bg-ifes-green-600 hover:bg-ifes-green-500 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Cadastrando..." : "Cadastrar-se"}
                    </button>
                    <button
                        type="button"
                        data-cy="reset-password-back"
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

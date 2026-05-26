import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider/AuthProvider";
import { useForm } from 'react-hook-form';
import api from "../../services/api";


export function SignupForm() {
    const { register, handleSubmit, watch } = useForm();
    const { createUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (data) => {
        setIsLoading(true);

        try {
            const credential = await createUser(data.email, data.senha);

            const payload = {
                firebase_uid: credential.user.uid,
                email: credential.user.email,
                password: data.senha,
                name: data.nome
            };

            await api.post("/api/users/User/", payload);
            
            navigate("/login");
        } catch (error) {
            console.error("Error code:", error.code, "Error message:", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md rounded-lg bg-gray-900 p-5 shadow-xl xs:p-6 md:p-10">

            <form className="space-y-5" onSubmit={handleSubmit(handleSignup)}>
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
                        {...register('nome', { required: true })}
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
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
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
                    <label htmlFor="senha2" className="block text-sm font-medium text-gray-300">
                        Escreva a sua senha novamente:
                    </label>
                    <input
                        type="password"
                        name="senha2"
                        id="senha2"
                        placeholder="Escreva sua senha"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Cadastrando..." : "Cadastrar-se"}
                    </button>
                    <button
                        type="button"
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                        onClick={() => navigate('/login')}
                    >
                        Voltar
                    </button>
                </footer>
            </form>
        </div>
    )
}

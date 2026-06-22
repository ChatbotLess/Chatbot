import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider/AuthProvider";
import { useForm } from 'react-hook-form';

export function ResetPassEmail() {
    const { register, handleSubmit } = useForm();
    const { resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async (data) => {
        const actionCodeSettings = {
            url: "http://localhost:5173/", // sua página
            handleCodeInApp: true,
        };

        try {
            await resetPassword(data.email, actionCodeSettings);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white rounded-lg p-10 shadow-xl w-full max-w-md">

            <form className="space-y-5" onSubmit={handleSubmit(handleReset)}>
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-950">Esqueci minha Senha:</h1>
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
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:border-transparent transition-all"
                        {...register('email', { required: true })}
                    />
                </div>

                <footer className="mt-6 space-y-5">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-ifes-green-600 hover:bg-ifes-green-500 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ifes-green-500/60 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Mandar E-mail
                    </button>
                </footer>
            </form>

        </div>
    )
}
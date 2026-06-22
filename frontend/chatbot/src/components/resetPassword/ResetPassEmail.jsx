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
        setIsLoading(true);

        const actionCodeSettings = {
            url: "http://localhost:5173/", // sua página
            handleCodeInApp: true,
        };

        try {
            await resetPassword(data.email, actionCodeSettings);
            navigate("/");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg p-10 shadow-xl w-full max-w-md" data-cy="reset-email-card">

            <form className="space-y-5" onSubmit={handleSubmit(handleReset)} data-cy="reset-email-form">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Esqueci minha Senha:</h1>
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
                        data-cy="reset-email-input"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                        {...register('email', { required: true })}
                    />
                </div>

                <footer className="mt-6 space-y-5">
                    <button
                        type="submit"
                        disabled={isLoading}
                        data-cy="reset-email-submit"
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Mandar E-mail
                    </button>
                </footer>
            </form>

        </div>
    )
}

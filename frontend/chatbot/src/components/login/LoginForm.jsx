import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from 'react-hook-form';

export function LoginForm() {
    const { register, handleSubmit, reset, watch } = useForm();

    const handleLogin = async (data) => {

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                data.email,
                data.senha
            );

            console.log("logou")
            navigate(`/`);

        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.log("errorCode:", errorCode, "errorMessage:", errorMessage);
        }

    }

    const navigate = useNavigate();
    return (
        <div className="bg-gray-900 rounded-lg p-10 shadow-xl w-full max-w-md">

            <form action="" className="space-y-5" onSubmit={handleSubmit(handleLogin)}>
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
                        {...register('senha', { required: true })}
                    />
                </div>
                
                <div>
                    <p className="cursor-pointer text-gray-200" onClick={() => navigate('/signup')}>Esqueci minha senha</p>
                </div>

                <footer className="mt-6 space-y-5">
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Entrar
                    </button>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900" onClick={() => navigate('/signup')}
                    >
                        Cadastar-se
                    </button>
                </footer>
            </form>

        </div>
    )
}
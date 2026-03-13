export function LoginForm() {
    return (
        <div> c
            <header>
                <h1>LOGIN</h1>
            </header>
            <form action="">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email:
                </label>
                <input type="text" name="email" id="email" placeholder="Escreva seu email " />
                <label htmlFor="senha" className="block text-sm font-medium text-gray-300">
                    Senha:
                </label>
                <input type="password" name="senha" id="senha" placeholder="Escreva sua senha " />
            </form>
            <footer>
                <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900">
                    Entrar
                </button>
            </footer>
        </div>
    )
}
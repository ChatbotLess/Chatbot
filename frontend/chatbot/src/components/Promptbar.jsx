import { TbSend } from "react-icons/tb";
import { useSearchParams, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';


export function Promptbar() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const { conversationId } = useParams(); // Pega o ID da URL

  const handlePerguntar = async (data) => {
    if (data.message && data.message.trim() !== '') {
      if (conversationId) {
        console.log('Adicionando mensagem à conversa:', conversationId);
        reset(); 
      } else {
        const newId = `conv_${Date.now()}`;
        console.log('Criando nova conversa:', newId);
        navigate(`/chat/${newId}`);
      }
    }
  };

  return (
    <form className="w-full " onSubmit={handleSubmit(handlePerguntar)}>
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 gap-2">

        <input
          type="text"
          placeholder="Olá, como posso te ajudar?"
          className="flex bg-transparent outline-none text-gray-200 placeholder-gray-400 w-[100%]"
          {...register('message', { required: true })}
        />

        <button type="submit" className="p-2 rounded-lg hover:bg-gray-700 transition">
          <TbSend size={20} className="text-gray-300" />
        </button>

      </div>
    </form>
  )
}
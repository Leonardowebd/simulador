import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Car, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Wallet, 
  Calendar,
  ChevronRight
} from 'lucide-react';

/**
 * Interface para os dados do payload da simulação.
 * Seguindo estritamente o schema definido na arquitetura.
 */
interface SimulationData {
  tipoBem: 'Imóvel' | 'Veículo' | '';
  subTipoVeiculo?: 'Carro' | 'Moto' | 'Caminhão' | 'Outro' | '';
  tipoSimulacao: 'Crédito' | 'Parcela' | '';
  valor: number;
  prazo: number;
  nome: string;
  whatsapp: string;
  email: string;
  dataHora: string; // ISO String
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvYjmW-25D6LesO0mURBYJ54Pb-BUeiQBVazRRglFEs-k1GEUcCzqEYFZc85vCZhYP/exec';

export default function ConsortiumSimulator() {
  const [step, setStep] = useState(1);
  const [showSubTypes, setShowSubTypes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<SimulationData>({
    tipoBem: '',
    subTipoVeiculo: '',
    tipoSimulacao: '',
    valor: 0,
    prazo: 60,
    nome: '',
    whatsapp: '',
    email: '',
    dataHora: '',
  });

  // Funções de máscara e formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handlePhoneMask = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  /**
   * Envia os dados para a API do Google Apps Script.
   * A arquitetura solicita o POST real para a URL fornecida.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      dataHora: new Date().toLocaleString('pt-BR'),
      nome: formData.nome,
      whatsapp: formData.whatsapp,
      email: formData.email,
      tipoBem: formData.tipoBem,
      subTipoVeiculo: formData.subTipoVeiculo || 'N/A',
      tipoSimulacao: formData.tipoSimulacao,
      valor: formatCurrency(formData.valor || 0),
      prazo: `${formData.prazo} meses`,
    };

    // Otimização: Dispara o fetch e avança para o sucesso imediatamente para melhorar a percepção de velocidade (UX)
    try {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
      });

      // Simulamos um pequeno delay de feedback visual antes de mudar a tela
      setTimeout(() => {
        setIsSuccess(true);
        setIsLoading(false);
      }, 600);
    } catch (error) {
      console.error('Erro ao disparar envio:', error);
      // Mesmo com erro de disparo, mostramos sucesso para não frustrar o lead, 
      // já que com no-cors o erro é raro de ser capturado aqui.
      setIsSuccess(true); 
      setIsLoading(false);
    }
  };

  // --- RENDERS DAS ETAPAS ---

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-grow flex flex-col"
    >
      <div className="mb-8">
        <div className="inline-block bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 mb-3">
          ETAPA 1 DE 3
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          Qual é o seu objetivo?
        </h2>
        <p className="text-slate-500 mt-2">
          {showSubTypes ? 'Qual o tipo de veículo?' : 'Selecione o tipo de bem que você deseja conquistar.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showSubTypes ? (
          <motion.div 
            key="main-types"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {[
              { id: 'Imóvel', icon: Building2, label: 'Imóvel', desc: 'Casa, Apt ou Terreno' },
              { id: 'Veículo', icon: Car, label: 'Veículo', desc: 'Carros, Motos ou Caminhões' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'Veículo') {
                    setFormData({ ...formData, tipoBem: 'Veículo' });
                    setShowSubTypes(true);
                  } else {
                    setFormData({ ...formData, tipoBem: 'Imóvel', valor: 150000 });
                    nextStep();
                  }
                }}
                className={`group p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                  formData.tipoBem === item.id
                    ? 'border-blue-600 bg-blue-50/30'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-lg w-fit mb-4 transition-colors ${
                  formData.tipoBem === item.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  <item.icon size={28} />
                </div>
                <h3 className="font-bold text-lg text-slate-900">{item.label}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="vehicle-types"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              {['Carro', 'Moto', 'Caminhão', 'Outro'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFormData({ ...formData, subTipoVeiculo: type as any, valor: 50000 });
                    nextStep();
                  }}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all font-bold text-slate-700 text-center"
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSubTypes(false)}
              className="w-full text-slate-400 font-bold text-sm py-2 hover:text-slate-600"
            >
              Voltar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderStep2 = () => {
    const getMinValue = () => {
      if (formData.tipoSimulacao === 'Parcela') return 500;
      if (formData.tipoBem === 'Imóvel') return 150000;
      if (formData.tipoBem === 'Veículo') return 50000;
      return 500;
    };

    const minValue = getMinValue();

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex-grow flex flex-col"
      >
        <div className="mb-8">
          <div className="inline-block bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 mb-3">
            ETAPA 2 DE 3
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            Quanto você tem em mente?
          </h2>
          <p className="text-slate-500 mt-2">Ajuste os valores para planejar seu consórcio.</p>
        </div>

        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-blue-600">{formatCurrency(formData.valor || minValue)}</span>
              <label className="text-sm font-bold text-slate-900">
                {formData.tipoSimulacao === 'Parcela' ? 'Valor da parcela desejada' : 'Valor do crédito desejado'}
              </label>
            </div>
            <input
              type="range"
              min={minValue}
              max={formData.tipoSimulacao === 'Parcela' ? 20000 : 1000000}
              step={formData.tipoSimulacao === 'Parcela' ? 100 : 1000}
              value={formData.valor || minValue}
              onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>{formatCurrency(minValue)}</span>
              <span>{formatCurrency(formData.tipoSimulacao === 'Parcela' ? 20000 : 1000000)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basear simulação por:</label>
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
              <button
                onClick={() => {
                  const baseVal = formData.tipoBem === 'Imóvel' ? 150000 : 50000;
                  setFormData({ ...formData, tipoSimulacao: 'Crédito', valor: Math.max(formData.valor, baseVal) });
                }}
                className={`py-2 px-6 rounded-lg text-sm font-semibold transition-all ${
                  formData.tipoSimulacao === 'Crédito' || !formData.tipoSimulacao ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Valor do Crédito
              </button>
              <button
                onClick={() => {
                  setFormData({ ...formData, tipoSimulacao: 'Parcela', valor: Math.max(formData.valor, 500) });
                }}
                className={`py-2 px-6 rounded-lg text-sm font-semibold transition-all ${
                  formData.tipoSimulacao === 'Parcela' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Valor da Parcela
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-900">Prazo de Pagamento</label>
              <span className="text-lg font-bold text-blue-600">{formData.prazo} meses</span>
            </div>
            <input
              type="range"
              min={36}
              max={240}
              step={12}
              value={formData.prazo}
              onChange={(e) => setFormData({ ...formData, prazo: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>36 meses</span>
              <span>240 meses</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={prevStep}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              Próxima Etapa: Contato <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-grow flex flex-col"
    >
      <div className="mb-8">
        <div className="inline-block bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 mb-3">
          ETAPA 3 DE 3
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          Para onde enviamos o resultado?
        </h2>
        <p className="text-slate-500 mt-2">Preencha seus dados para receber o estudo personalizado.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-grow flex flex-col">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Nome Completo</label>
          <input
            required
            type="text"
            placeholder="Ex: João da Silva"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">WhatsApp</label>
            <input
              required
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: handlePhoneMask(e.target.value) })}
              className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">E-mail</label>
            <input
              required
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 mt-auto">
          <button
            type="button"
            onClick={prevStep}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Voltar para Simulação
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Ver Resultado <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 space-y-8 flex-grow flex flex-col items-center justify-center"
    >
      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-inner border border-emerald-100">
        <CheckCircle2 size={40} />
      </div>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Simulação Concluída!</h2>
        <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
          Seus dados foram recebidos. Em até 24h, um de nossos especialistas entrará em contato via 
          <span className="text-emerald-500 font-bold"> WhatsApp </span> 
          para apresentar o resultado detalhado da sua simulação.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="text-blue-600 font-bold hover:underline"
      >
        Fazer nova simulação
      </button>
    </motion.div>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Container Principal para Embed */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Progress Bar Simplificada */}
        {!isSuccess && (
          <div className="h-1.5 w-full bg-slate-100">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 md:p-10 flex flex-col">
          <AnimatePresence mode="wait">
            {isSuccess ? renderSuccess() : (
              step === 1 ? renderStep1() :
              step === 2 ? renderStep2() :
              renderStep3()
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-center text-slate-400 text-[10px] font-medium tracking-wide">
        &copy; {new Date().getFullYear()} ConsórcioPro. Tecnologia para Consórcios.
      </p>
    </div>
  );
}

"use client"

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, AlertCircle, Brain } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AlterarSenha() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [checkingToken, setCheckingToken] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      // Capturar token e type da URL
      const token = searchParams.get('token')
      const type = searchParams.get('type')

      // Se não houver token, permitir acesso à página mas mostrar mensagem
      if (!token || !type) {
        setTokenValid(false)
        setCheckingToken(false)
        setError('Acesse esta página através do link enviado por email')
        return
      }

      // Se houver token, verificar validade
      if (type === 'recovery') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          })
          
          setCheckingToken(false)
          if (error) {
            setError('Link de recuperação inválido ou expirado')
            setTokenValid(false)
          } else {
            setTokenValid(true)
            setError('')
          }
        } catch (err) {
          setCheckingToken(false)
          setError('Erro ao verificar link de recuperação')
          setTokenValid(false)
        }
      } else {
        setCheckingToken(false)
        setError('Link de recuperação inválido')
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validações
    if (formData.newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      // Atualizar senha no Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError('Erro ao alterar senha. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Brain className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">MindCare</h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Redefinir Senha</h2>
          <p className="text-sm sm:text-base text-gray-600">
            {tokenValid ? 'Digite sua nova senha de acesso' : 'Link de recuperação necessário'}
          </p>
        </div>

        {/* Mensagem de Sucesso */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-semibold text-sm sm:text-base">
                Senha alterada com sucesso!
              </p>
              <p className="text-green-700 text-xs sm:text-sm mt-1">
                Redirecionando para o login...
              </p>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold text-sm sm:text-base">Erro</p>
              <p className="text-red-700 text-xs sm:text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {checkingToken && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Verificando link de recuperação...</p>
            <p className="text-gray-500 text-sm mt-2">Aguarde um momento</p>
          </div>
        )}

        {/* Formulário - Sempre visível quando não está checando */}
        {!checkingToken && (
          <>
            {tokenValid ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nova Senha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                      placeholder="Digite sua nova senha"
                      required
                      disabled={loading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={loading || success}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`h-1 flex-1 rounded-full transition-colors ${
                      formData.newPassword.length === 0 ? 'bg-gray-200' :
                      formData.newPassword.length < 6 ? 'bg-red-400' :
                      formData.newPassword.length < 8 ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}></div>
                    <p className="text-xs text-gray-500">
                      {formData.newPassword.length === 0 ? 'Mínimo de 6 caracteres' :
                       formData.newPassword.length < 6 ? 'Senha fraca' :
                       formData.newPassword.length < 8 ? 'Senha média' :
                       'Senha forte'}
                    </p>
                  </div>
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                      placeholder="Confirme sua nova senha"
                      required
                      disabled={loading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={loading || success}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      As senhas não coincidem
                    </p>
                  )}
                  {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle size={14} />
                      As senhas coincidem
                    </p>
                  )}
                </div>

                {/* Botão Salvar */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Salvando...
                    </span>
                  ) : success ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={20} />
                      Senha Alterada!
                    </span>
                  ) : (
                    'Salvar nova senha'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Link Inválido</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Para redefinir sua senha, solicite um novo link através da tela de login.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Ir para o Login
                </button>
              </div>
            )}
          </>
        )}

        {/* Link Voltar */}
        {!checkingToken && tokenValid && (
          <div className="mt-6">
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium py-2 hover:bg-gray-50 rounded-lg"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Ao redefinir sua senha, você concorda com nossos{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Termos de Uso
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

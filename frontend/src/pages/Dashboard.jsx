import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { chatbotAPI, authAPI } from '../services/api'
import { Bot, Plus, LogOut, Activity, MessageSquare, Clock, Users } from 'lucide-react'

export default function Dashboard() {
  const [chatbots, setChatbots] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, botsRes] = await Promise.all([
        authAPI.getMe(),
        chatbotAPI.getAll()
      ])
      setUser(userRes.data)
      setChatbots(botsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold">Chatbot Platform</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.full_name || user?.username}</span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h2>
          <p className="text-gray-600">Manage your AI chatbots</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-1">{chatbots.length}</p>
            <p className="text-sm text-gray-600">Total Bots</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-1">
              {chatbots.filter(b => b.is_active).length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-1">—</p>
            <p className="text-sm text-gray-600">Messages</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-1">—</p>
            <p className="text-sm text-gray-600">Avg Response</p>
          </div>
        </div>

        {/* Chatbots */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Chatbots</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chatbot
          </button>
        </div>

        {chatbots.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chatbots yet</h3>
            <p className="text-gray-600 mb-6">Create your first chatbot to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Chatbot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((bot) => (
              <Link
                key={bot.id}
                to={`/chatbot/${bot.id}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    bot.is_active 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {bot.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{bot.name}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {bot.description || 'No description'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>{bot.ai_enabled ? 'AI On' : 'AI Off'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBotModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

function CreateBotModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await chatbotAPI.create(formData)
      onSuccess()
    } catch (err) {
      alert('Failed to create chatbot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Create New Chatbot</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field"
              rows="3"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

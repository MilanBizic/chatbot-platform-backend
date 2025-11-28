import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { chatbotAPI } from '../services/api'
import { ArrowLeft, Bot, Plus, Trash2, ToggleLeft, ToggleRight, MessageSquare } from 'lucide-react'

export default function ChatbotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [chatbot, setChatbot] = useState(null)
  const [keywords, setKeywords] = useState([])
  const [messages, setMessages] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddKeyword, setShowAddKeyword] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [botRes, keywordsRes, messagesRes, analyticsRes] = await Promise.all([
        chatbotAPI.getOne(id),
        chatbotAPI.getKeywords(id),
        chatbotAPI.getMessages(id, 10),
        chatbotAPI.getAnalytics(id)
      ])
      setChatbot(botRes.data)
      setKeywords(keywordsRes.data)
      setMessages(messagesRes.data)
      setAnalytics(analyticsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleAI = async () => {
    try {
      await chatbotAPI.update(id, { ai_enabled: !chatbot.ai_enabled })
      fetchData()
    } catch (err) {
      alert('Failed to update')
    }
  }

  const toggleActive = async () => {
    try {
      await chatbotAPI.update(id, { is_active: !chatbot.is_active })
      fetchData()
    } catch (err) {
      alert('Failed to update')
    }
  }

  const deleteKeyword = async (keywordId) => {
    if (!confirm('Delete this keyword?')) return
    try {
      await chatbotAPI.deleteKeyword(keywordId)
      fetchData()
    } catch (err) {
      alert('Failed to delete')
    }
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{chatbot.name}</h1>
              <p className="text-gray-600">{chatbot.description || 'No description'}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleActive}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  chatbot.is_active
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {chatbot.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Messages</p>
            <p className="text-2xl font-semibold">{analytics?.total_messages || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Keyword Responses</p>
            <p className="text-2xl font-semibold">{analytics?.keyword_responses || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{analytics?.keyword_percentage || 0}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">AI Responses</p>
            <p className="text-2xl font-semibold">{analytics?.ai_responses || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{analytics?.ai_percentage || 0}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Keywords</p>
            <p className="text-2xl font-semibold">{keywords.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Keywords */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keywords</h3>
              <button
                onClick={() => setShowAddKeyword(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {keywords.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <p className="text-gray-600 text-sm">No keywords yet</p>
                </div>
              ) : (
                keywords.map((kw) => (
                  <div key={kw.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900">{kw.keyword}</span>
                      <button
                        onClick={() => deleteKeyword(kw.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{kw.response}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settings & Messages */}
          <div className="space-y-6">
            {/* Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">AI Assistant</p>
                    <p className="text-sm text-gray-600">Use Claude AI for responses</p>
                  </div>
                  <button onClick={toggleAI}>
                    {chatbot.ai_enabled ? (
                      <ToggleRight className="w-10 h-10 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Messages */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">{msg.customer_message}</p>
                      <p className="text-sm text-gray-600 mb-2">{msg.bot_response}</p>
                      <span className="text-xs text-gray-500">{msg.response_type}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Keyword Modal */}
      {showAddKeyword && (
        <AddKeywordModal
          chatbotId={id}
          onClose={() => setShowAddKeyword(false)}
          onSuccess={() => {
            setShowAddKeyword(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

function AddKeywordModal({ chatbotId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ keyword: '', response: '', priority: 0 })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await chatbotAPI.addKeyword(chatbotId, formData)
      onSuccess()
    } catch (err) {
      alert('Failed to add keyword')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Add Keyword</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
            <input
              type="text"
              value={formData.keyword}
              onChange={(e) => setFormData({...formData, keyword: e.target.value})}
              className="input-field"
              placeholder="e.g., dostava"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response</label>
            <textarea
              value={formData.response}
              onChange={(e) => setFormData({...formData, response: e.target.value})}
              className="input-field"
              rows="4"
              placeholder="Bot response when keyword is detected"
              required
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Adding...' : 'Add Keyword'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

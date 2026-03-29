import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import consultationService from '../services/consultationService'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'

const Consultations = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const consultationIdParam = searchParams.get('id')

  const [consultations, setConsultations] = useState([])
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Modal state
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null
  })

  const showModal = (title, message, type = 'info', onClose = null) => {
    setModal({ show: true, title, message, type, onClose })
  }

  const closeModal = () => {
    const onClose = modal.onClose
    setModal({ show: false, title: '', message: '', type: 'info', onClose: null })
    if (onClose) onClose()
  }

  useEffect(() => {
    fetchConsultations()
  }, [])

  useEffect(() => {
    if (consultationIdParam && consultations.length > 0) {
      const found = consultations.find(c => c.id === parseInt(consultationIdParam))
      if (found) {
        selectConsultation(found)
      }
    }
  }, [consultationIdParam, consultations])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const response = await consultationService.getConsultations()

      // Handle different response formats
      let consultationsData = []
      if (Array.isArray(response.data)) {
        consultationsData = response.data
      } else if (response.data && Array.isArray(response.data.results)) {
        consultationsData = response.data.results
      } else if (response.data && Array.isArray(response.data.consultations)) {
        consultationsData = response.data.consultations
      }

      setConsultations(consultationsData)
    } catch (error) {
      console.error('Error fetching consultations:', error)
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const selectConsultation = async (consultation) => {
    setSelectedConsultation(consultation)
    await fetchMessages(consultation.id)
  }

  const fetchMessages = async (consultationId) => {
    try {
      const response = await consultationService.getMessages(consultationId)

      // Handle different response formats
      let messagesData = []
      if (Array.isArray(response.data)) {
        messagesData = response.data
      } else if (response.data && Array.isArray(response.data.results)) {
        messagesData = response.data.results
      } else if (response.data && Array.isArray(response.data.messages)) {
        messagesData = response.data.messages
      }

      setMessages(messagesData)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConsultation) return

    try {
      setSendingMessage(true)
      await consultationService.sendMessage(selectedConsultation.id, {
        content: newMessage,
        message_type: 'text'
      })

      setNewMessage('')
      await fetchMessages(selectedConsultation.id)
    } catch (error) {
      console.error('Error sending message:', error)
      showModal('Error', 'Failed to send message. Please try again.', 'error')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleAcceptConsultation = async (consultationId) => {
    try {
      await consultationService.acceptConsultation(consultationId)
      await fetchConsultations()
      const updated = consultations.find(c => c.id === consultationId)
      if (updated) {
        setSelectedConsultation({ ...updated, status: 'accepted' })
      }
      showModal('Success!', 'Consultation accepted! You can now start chatting.', 'success')
    } catch (error) {
      console.error('Error accepting consultation:', error)
      showModal('Error', 'Failed to accept consultation.', 'error')
    }
  }

  const handleEndConsultation = async (consultationId) => {
    if (!confirm('Are you sure you want to end this consultation? Charges will be calculated.')) return

    try {
      await consultationService.endConsultation(consultationId)
      await fetchConsultations()
      setSelectedConsultation(null)
      setMessages([])
      showModal('Success!', 'Consultation ended successfully! Charges have been calculated and deducted.', 'success')
    } catch (error) {
      console.error('Error ending consultation:', error)
      showModal('Error', 'Failed to end consultation. Please try again.', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      ongoing: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Consultations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">All Consultations</h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {consultations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No consultations yet</p>
                  <button
                    onClick={() => navigate('/astrologers')}
                    className="mt-4 text-primary-600 hover:underline"
                  >
                    Find an astrologer
                  </button>
                </div>
              ) : (
                consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    onClick={() => selectConsultation(consultation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedConsultation?.id === consultation.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-900">
                          {consultation.astrologer_details?.display_name || 'Astrologer'}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {consultation.consultation_type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(consultation.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedConsultation ? (
            <div className="bg-white rounded-lg shadow-md flex flex-col h-[600px]">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedConsultation.astrologer_details?.display_name || 'Astrologer'}
                    </h2>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedConsultation.consultation_type} • ₹{selectedConsultation.rate_per_minute}/min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedConsultation.status)}`}>
                      {selectedConsultation.status}
                    </span>
                    {selectedConsultation.status === 'pending' && user.user_type === 'astrologer' && (
                      <button
                        onClick={() => handleAcceptConsultation(selectedConsultation.id)}
                        className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                    )}
                    {['accepted', 'ongoing'].includes(selectedConsultation.status) && (
                      <button
                        onClick={() => handleEndConsultation(selectedConsultation.id)}
                        className="bg-red-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-red-700"
                      >
                        End
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">
                      {selectedConsultation.status === 'pending'
                        ? 'Waiting for astrologer to accept...'
                        : 'Start the conversation!'}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.sender === user.id
                    return (
                      <div key={message.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          isMyMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${isMyMessage ? 'text-primary-100' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Input */}
              {['accepted', 'ongoing'].includes(selectedConsultation.status) && (
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              )}

              {selectedConsultation.status === 'pending' && (
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm text-center">
                  Waiting for astrologer to accept the consultation request...
                </div>
              )}

              {selectedConsultation.status === 'completed' && (
                <div className="p-4 bg-gray-50 text-gray-600 text-sm text-center">
                  This consultation has ended. Total: ₹{selectedConsultation.total_amount}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500 h-[600px] flex items-center justify-center">
              <div>
                <div className="text-6xl mb-4">💬</div>
                <p className="text-xl font-semibold mb-2">Select a consultation</p>
                <p>Choose a consultation from the list to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={modal.show}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

export default Consultations

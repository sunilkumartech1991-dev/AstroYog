import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import userService from '../services/userService'
import paymentService from '../services/paymentService'
import Modal from '../components/Modal'

const Wallet = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [addMoneyAmount, setAddMoneyAmount] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null
  })

  useEffect(() => {
    fetchWalletData()
  }, [])

  const showModal = (title, message, type = 'info', onClose = null) => {
    setModal({ show: true, title, message, type, onClose })
  }

  const closeModal = () => {
    const onClose = modal.onClose
    setModal({ show: false, title: '', message: '', type: 'info', onClose: null })
    if (onClose) onClose()
  }

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const [profileRes, transactionsRes] = await Promise.all([
        userService.getProfile(),
        userService.getWalletTransactions()
      ])
      setUser(profileRes.data)
      setTransactions(Array.isArray(transactionsRes.data) ? transactionsRes.data : [])
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      if (error.response?.status === 401) {
        navigate('/login?redirect=/wallet')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async () => {
    if (!addMoneyAmount || parseFloat(addMoneyAmount) <= 0) {
      showModal('Error', 'Please enter a valid amount', 'error')
      return
    }

    try {
      setTransactionLoading(true)
      // Initiate payment through payment gateway
      const response = await paymentService.initiatePayment({
        amount: parseFloat(addMoneyAmount),
        purpose: 'wallet_recharge',
        return_url: `${window.location.origin}/wallet?payment=success`,
        cancel_url: `${window.location.origin}/wallet?payment=cancelled`
      })

      // Redirect to payment gateway (PayU or other)
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url
      } else if (response.data.form_data) {
        // For PayU, might need to submit form
        submitPaymentForm(response.data.form_data, response.data.action_url)
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      showModal('Error', error.response?.data?.message || 'Failed to initiate payment. Please try again.', 'error')
    } finally {
      setTransactionLoading(false)
    }
  }

  const submitPaymentForm = (formData, actionUrl) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = actionUrl

    Object.keys(formData).forEach(key => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = formData[key]
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  const getFilteredTransactions = () => {
    if (filterType === 'all') return transactions
    return transactions.filter(t => t.transaction_type === filterType)
  }

  const quickAddAmounts = [100, 250, 500, 1000, 2000, 5000]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg p-8 mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-primary-100 mb-2">Available Balance</p>
            <h2 className="text-4xl font-bold">₹{user?.wallet_balance || '0.00'}</h2>
          </div>
          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
          >
            + Add Money
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 text-xl">↑</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Credits</p>
              <p className="text-xl font-bold text-green-600">
                ₹{transactions
                  .filter(t => t.transaction_type === 'credit' && t.status === 'success')
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-red-600 text-xl">↓</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Debits</p>
              <p className="text-xl font-bold text-red-600">
                ₹{transactions
                  .filter(t => t.transaction_type === 'debit' && t.status === 'success')
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-xl font-bold text-blue-600">{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'credit'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Credits
            </button>
            <button
              onClick={() => setFilterType('debit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'debit'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Debits
            </button>
          </div>
        </div>

        {getFilteredTransactions().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-gray-600 text-lg mb-2">No transactions yet</p>
            <p className="text-gray-500 text-sm">
              {filterType === 'all'
                ? 'Add money to your wallet to get started'
                : `No ${filterType} transactions found`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {getFilteredTransactions().map((transaction) => (
              <div
                key={transaction.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.transaction_type === 'credit' ? '↑' : '↓'}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="ml-11 mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="text-gray-600">
                        Ref: {transaction.reference_id}
                      </span>
                      {transaction.payment_method && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {transaction.payment_method}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className={`text-lg font-bold ${
                        transaction.transaction_type === 'credit'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.transaction_type === 'credit' ? '+' : '-'}₹
                      {transaction.amount}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                        transaction.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Balance: ₹{transaction.balance_after}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Money to Wallet</h3>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  min="10"
                  step="10"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Add</p>
              <div className="grid grid-cols-3 gap-2">
                {quickAddAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAddMoneyAmount(amount.toString())}
                    className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold transition"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddMoney}
              disabled={transactionLoading || !addMoneyAmount || parseFloat(addMoneyAmount) < 10}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {transactionLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Minimum amount: ₹10 | Maximum amount: ₹50,000
            </p>
          </div>
        </div>
      )}

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

export default Wallet

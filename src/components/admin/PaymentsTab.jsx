import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const PaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    totalTransactions: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0
  });

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          orders(
            order_number,
            user_id,
            user_profiles(username)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);

      // Calculate stats
      const revenue = data
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const pending = data
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const paidCount = data.filter(p => p.status === 'succeeded').length;
      const pendingCount = data.filter(p => p.status === 'pending').length;
      const failedCount = data.filter(p => p.status === 'failed').length;

      setStats({
        totalRevenue: revenue.toFixed(2),
        pendingAmount: pending.toFixed(2),
        totalTransactions: data.length,
        paidCount,
        pendingCount,
        failedCount
      });
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ status: newStatus })
        .eq('id', paymentId);

      if (error) throw error;
      loadPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-orange-100 text-orange-700',
      succeeded: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      refunded: 'bg-blue-100 text-blue-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'All') return true;
    if (filter === 'Paid') return payment.status === 'succeeded';
    if (filter === 'Pending') return payment.status === 'pending';
    if (filter === 'Failed') return payment.status === 'failed';
    return true;
  });

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ₱{parseFloat(stats.totalRevenue).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ₱{parseFloat(stats.pendingAmount).toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>

          <div className="flex gap-2">
            {['All', 'Paid', 'Pending', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === status
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {payment.orders?.order_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {payment.orders?.user_profiles?.username || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        ₱{parseFloat(payment.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                        {payment.transaction_id?.substring(0, 12)}...
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {payment.payment_method?.toUpperCase() || 'COD'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                          {payment.status === 'succeeded' ? 'Paid' : 
                           payment.status === 'pending' ? 'Pending' : 
                           payment.status === 'failed' ? 'Failed' : payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={payment.status}
                          onChange={(e) => updatePaymentStatus(payment.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="succeeded">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsTab;
import { useState } from 'react'
import { transactions as initialTransactions, categories } from './data'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import './index.css'

// Google Fonts
const link = document.createElement('link')
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
link.rel = 'stylesheet'
document.head.appendChild(link)

const fmt = (n) => '₹' + n.toLocaleString('en-IN')

const COLORS = ['#6366f1','#22c55e','#f43f5e','#f59e0b','#22d3ee','#a855f7','#fb923c','#94a3b8']

// ─── SUMMARY CARDS ───────────────────────────────────────────
function Summary({ txns }) {
  const totalIncome  = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance      = totalIncome - totalExpense

  return (
    <div className="cards-grid">
      <div className="card">
        <div className="card-label">Total Balance</div>
        <div className="card-value balance">{fmt(balance)}</div>
      </div>
      <div className="card">
        <div className="card-label">Total Income</div>
        <div className="card-value income">{fmt(totalIncome)}</div>
      </div>
      <div className="card">
        <div className="card-label">Total Expenses</div>
        <div className="card-value expense">{fmt(totalExpense)}</div>
      </div>
    </div>
  )
}

// ─── CHARTS ──────────────────────────────────────────────────
function Charts({ txns }) {
  // Monthly balance trend — group by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr']
  const monthlyData = months.map((month, i) => {
    const monthNum = String(i + 1).padStart(2, '0')
    const monthTxns = txns.filter(t => t.date.startsWith(`2026-${monthNum}`))
    const income  = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { month, income, expense, balance: income - expense }
  })

  // Spending by category — only expenses
  const expenseByCategory = {}
  txns.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
  })
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))

  return (
    <div className="charts-row">

      {/* Line Chart */}
      <div className="section-box">
        <div className="section-title">Monthly Balance Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => '₹' + (v/1000) + 'k'} />
            <Tooltip
              formatter={(value) => fmt(value)}
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Line type="monotone" dataKey="income"  stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} name="Expense" />
            <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="section-box">
        <div className="section-title">Spending by Category</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => fmt(value)}
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            />
            <Legend
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

// ─── INSIGHTS ────────────────────────────────────────────────
function Insights({ txns }) {
  const totalIncome  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Highest spending category
  const expenseByCategory = {}
  txns.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
  })
  const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]

  // Month with highest expense
  const months = ['Jan','Feb','Mar','Apr']
  const expenseByMonth = months.map((month, i) => {
    const monthNum = String(i + 1).padStart(2, '0')
    const total = txns
      .filter(t => t.type === 'expense' && t.date.startsWith(`2026-${monthNum}`))
      .reduce((s, t) => s + t.amount, 0)
    return { month, total }
  })
  const worstMonth = expenseByMonth.sort((a, b) => b.total - a.total)[0]

  // Savings rate
  const savingsRate = totalIncome > 0
    ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
    : 0

  // Avg transaction
  const expenses = txns.filter(t => t.type === 'expense')
  const avgExpense = expenses.length > 0
    ? (expenses.reduce((s, t) => s + t.amount, 0) / expenses.length).toFixed(0)
    : 0

  const cards = [
    { label: 'Top Spending Category', value: topCategory ? `${topCategory[0]}` : '—', sub: topCategory ? fmt(topCategory[1]) + ' total' : '' },
    { label: 'Highest Expense Month', value: worstMonth.month, sub: fmt(worstMonth.total) + ' spent' },
    { label: 'Savings Rate',          value: `${savingsRate}%`, sub: 'of total income saved' },
    { label: 'Avg. Expense',          value: fmt(Number(avgExpense)), sub: `across ${expenses.length} expenses` },
  ]

  return (
    <div className="section-box">
      <div className="section-title">Financial Insights</div>
      <div className="insights-grid">
        {cards.map((c, i) => (
          <div className="insight-card" key={i}>
            <div className="insight-label">{c.label}</div>
            <div className="insight-value">{c.value}</div>
            {c.sub && <div style={{ fontSize: 12, color: 'var(--subtext)', marginTop: 4 }}>{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ROLE SWITCHER ───────────────────────────────────────────
function RoleSwitch({ role, setRole }) {
  return (
    <div className="role-bar">
      <label>Logged in as:</label>
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="viewer">👁 Viewer</option>
        <option value="admin">🛡 Admin</option>
      </select>
    </div>
  )
}

// ─── TRANSACTIONS ────────────────────────────────────────────
function Transactions({ txns, setTxns, role }) {
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat,  setFilterCat]  = useState('All')
  const [sortBy,     setSortBy]     = useState('date')
  const [sortDir,    setSortDir]    = useState('desc')
  const [showForm,   setShowForm]   = useState(false)
  const [newTxn,     setNewTxn]     = useState({
    description: '', category: 'Food', type: 'expense', amount: '', date: ''
  })

  let filtered = txns
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => filterCat  === 'All' || t.category === filterCat)
    .filter(t => t.description.toLowerCase().includes(search.toLowerCase()))

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      return sortDir === 'desc'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    } else {
      return sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount
    }
  })

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function handleAdd() {
    if (!newTxn.description || !newTxn.amount || !newTxn.date) return
    setTxns(prev => [{ ...newTxn, id: Date.now(), amount: parseFloat(newTxn.amount) }, ...prev])
    setNewTxn({ description: '', category: 'Food', type: 'expense', amount: '', date: '' })
    setShowForm(false)
  }

  function handleDelete(id) {
    setTxns(prev => prev.filter(t => t.id !== id))
  }

  const arrow = (col) => sortBy === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''

  return (
    <div className="section-box">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 18 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Transactions</div>
        {role === 'admin' && (
          <button className="btn-add" onClick={() => setShowForm(f => !f)}>
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        )}
      </div>

      {role === 'admin' && showForm && (
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 16, marginBottom: 16,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10
        }}>
          {[
            { placeholder: 'Description', key: 'description', type: 'text' },
            { placeholder: 'Amount (₹)',  key: 'amount',      type: 'number' },
            { placeholder: 'Date',        key: 'date',        type: 'date' },
          ].map(f => (
            <input
              key={f.key}
              placeholder={f.placeholder}
              type={f.type}
              value={newTxn[f.key]}
              onChange={e => setNewTxn(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)', padding:'8px 12px', borderRadius:8, fontSize:13 }}
            />
          ))}
          {[
            { key: 'category', options: categories.filter(c => c !== 'All') },
            { key: 'type',     options: ['expense', 'income'] },
          ].map(f => (
            <select
              key={f.key}
              value={newTxn[f.key]}
              onChange={e => setNewTxn(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)', padding:'8px 12px', borderRadius:8, fontSize:13 }}
            >
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          <button className="btn-add" onClick={handleAdd}>Save</button>
        </div>
      )}

      <div className="filters-row">
        <input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No transactions found. Try adjusting your filters.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>Date{arrow('date')}</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th onClick={() => handleSort('amount')}>Amount{arrow('amount')}</th>
              {role === 'admin' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td style={{ color:'var(--subtext)' }}>{t.date}</td>
                <td>{t.description}</td>
                <td>{t.category}</td>
                <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                <td className={`amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                {role === 'admin' && (
                  <td>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{ background:'#4c0519', color:'var(--expense)', border:'none', padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:12 }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── APP ─────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [role,       setRole]       = useState('viewer')
  const [txns,       setTxns]       = useState(initialTransactions)

  const navItems = [
    { id: 'dashboard',    label: '📊 Dashboard' },
    { id: 'transactions', label: '💳 Transactions' },
    { id: 'insights',     label: '💡 Insights' },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Zorvyn Finance</div>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </div>
        ))}
      </aside>

      <main className="main-content">
        <RoleSwitch role={role} setRole={setRole} />

        <div className="page-title">
          {activePage === 'dashboard'    && 'Dashboard Overview'}
          {activePage === 'transactions' && 'Transactions'}
          {activePage === 'insights'     && 'Insights'}
        </div>

        {activePage === 'dashboard' && (
          <>
            <Summary txns={txns} />
            <Charts  txns={txns} />
          </>
        )}

        {activePage === 'transactions' && (
          <Transactions txns={txns} setTxns={setTxns} role={role} />
        )}

        {activePage === 'insights' && (
          <Insights txns={txns} />
        )}
      </main>
    </div>
  )
}
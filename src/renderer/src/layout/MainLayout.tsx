import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useStore } from '../lib/store'

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const prdHistory = useStore((s) => s.prdHistory)

  const navItems = [
    { label: 'Editor', path: '/editor' },
    {
      label: 'History',
      path: '/history',
      badge: prdHistory.length > 0 ? String(prdHistory.length) : undefined
    },
    { label: 'Settings', path: '/settings' }
  ]

  return (
    <div className="h-screen w-screen bg-stone-50 flex flex-col text-stone-800 font-sans overflow-hidden selection:bg-peach-200 selection:text-stone-900 print:h-auto print:overflow-visible">
      <header className="h-20 px-8 flex items-center justify-between bg-stone-50 border-b border-stone-200/50 z-20 drag-region print:hidden">
        <div className="flex items-center gap-12">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/editor')}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-800 to-sage-500 shadow-inner flex items-center justify-center text-white relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="font-semibold tracking-tight text-lg font-sans text-stone-900 group-hover:text-sage-800 transition-colors">
              Scope<span className="font-light text-stone-500">Sight</span>
            </span>
          </div>
          <nav className="hidden md:flex p-1 bg-stone-200/50 rounded-full">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  'px-6 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 active:scale-95',
                  location.pathname === item.path
                    ? 'bg-white shadow-sm text-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                )}
              >
                {item.label}
                {item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      location.pathname === item.path
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-300 text-stone-600'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              useStore.getState().createNewDraft()
              navigate('/editor')
            }}
            className="hidden lg:flex items-center gap-2 px-5 py-1.5 bg-stone-900 text-white rounded-full text-sm font-medium shadow-lg shadow-stone-900/10 hover:bg-stone-800 transition-all active:scale-95"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New PRD
          </button>
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-stone-400 px-3 py-1 bg-stone-100 rounded-lg border border-stone-200">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            System Operational
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600 active:scale-95"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                  <h3 className="font-semibold text-stone-900">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="p-12 flex flex-col items-center justify-center text-center bg-white">
                  <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center mb-4 text-stone-400">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 0 0 1-3.46 0"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">You're all caught up</p>
                  <p className="text-xs text-stone-500 mt-1">No new notifications right now.</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 active:scale-95"
          >
            <span className="text-xs font-bold">PT</span>
          </button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:block print:h-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout

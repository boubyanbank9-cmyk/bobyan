import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { markContactMessagesSeen } from '../hooks/useAdminNotifications'
import { adminCardClass, formatDate } from './adminStyles'

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const markRead = async (msg) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id)
    setSelected({ ...msg, is_read: true })
    load()
  }

  const openMessage = (msg) => {
    setSelected(msg)
    markContactMessagesSeen()
    window.dispatchEvent(new Event('alain-contact-seen'))
    if (!msg.is_read) markRead(msg)
  }

  const detailContent = selected && (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-black break-words">{selected.name}</h2>
      <p className="font-bold text-slate-600 break-all">{selected.email}</p>
      {selected.phone && <p className="font-bold text-slate-600" dir="ltr">{selected.phone}</p>}
      {selected.subject && <p className="font-black text-admin-dark">{selected.subject}</p>}
      <p className="font-bold text-slate-800 leading-8 whitespace-pre-wrap break-words">{selected.message}</p>
      <p className="text-sm text-slate-400 font-bold">{formatDate(selected.created_at)}</p>
    </div>
  )

  return (
    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
      <div className={adminCardClass}>
        <h2 className="font-black text-lg mb-4">الرسائل ({messages.length})</h2>
        {loading ? (
          <p className="font-bold text-slate-500">جاري التحميل...</p>
        ) : messages.length === 0 ? (
          <p className="font-bold text-slate-500">لا توجد رسائل.</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => openMessage(msg)}
                className={`w-full text-right p-3 rounded-xl ${
                  selected?.id === msg.id
                    ? 'bg-admin-soft border border-admin/30'
                    : msg.is_read
                      ? 'bg-slate-50'
                      : 'bg-amber-50 border border-amber-100'
                }`}
              >
                <p className="font-black text-slate-900">{msg.name}</p>
                <p className="text-sm font-bold text-slate-600 truncate">{msg.subject || msg.message}</p>
                <p className="text-xs text-slate-400 font-bold">{formatDate(msg.created_at)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`hidden lg:block lg:col-span-2 ${adminCardClass}`}>
        {!selected ? <p className="font-bold text-slate-500">اختر رسالة</p> : detailContent}
      </div>

      {selected && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="إغلاق"
            onClick={() => setSelected(null)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-2 text-slate-800 font-black"
                aria-label="رجوع"
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  →
                </span>
                <span className="text-sm">رجوع</span>
              </button>
              <h3 className="flex-1 text-end font-black text-slate-900">تفاصيل الرسالة</h3>
            </div>
            {detailContent}
          </div>
        </div>
      )}
    </div>
  )
}

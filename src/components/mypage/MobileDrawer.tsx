'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function MobileDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname]) // 페이지 이동하면 자동으로 닫힘

  return (
    <>
      <button className="md:hidden" onClick={() => setOpen(true)}>☰</button>

      {/* 클릭하면 닫힘 */}
      {open && <div className="fixed inset-0 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed left-0 top-0 h-full transition-transform md:hidden
        ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {children}
      </aside>
    </>
  )
}
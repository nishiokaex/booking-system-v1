import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import { useEffect, useState } from 'react'
import { AppType } from '../functions/api/[[route]]'

const App = () => {
  const client = hc<AppType>('/')
  const $get = client.api.hello.$get

  const [data, setData] = useState<InferResponseType<typeof $get>>()

  useEffect(() => {
    const fetchData = async () => {
      const res = await $get({
        query: {
          name: 'Pages',
        },
      })
      const responseData = await res.json()
      setData(responseData)
    }
    fetchData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-semibold text-slate-800">予約管理サービス MVP</h1>
      <p className="text-lg text-slate-600">{data?.message}</p>
      <a
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-slate-700"
        href="/dashboard"
      >
        ダッシュボードへ
      </a>
    </main>
  )
}

export default App

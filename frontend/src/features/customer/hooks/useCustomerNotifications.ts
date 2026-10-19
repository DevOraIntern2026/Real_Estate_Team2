import { useCallback, useEffect, useState } from 'react'
import { customerNotificationsService, type CustomerNotification } from '../notifications/notifications.service'

const PAGE_SIZE = 5

export function useCustomerNotifications() {
  const [items, setItems] = useState<CustomerNotification[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async (nextPage: number, append: boolean) => {
    setError('')
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const result = await customerNotificationsService.list(nextPage, PAGE_SIZE)
      setItems((current) => append ? [...current, ...result.items] : result.items)
      setTotal(result.total)
      setPage(result.page)
      setTotalPages(result.totalPages)
    } catch {
      setError('We couldn’t load your notifications. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { void load(1, false) }, [load])

  const markAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await customerNotificationsService.markAllAsRead()
      setItems((current) => current.map((item) => ({ ...item, read: true })))
    } catch {
      setError('We couldn’t update your notifications. Please try again.')
    } finally {
      setMarkingAll(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await customerNotificationsService.markAsRead(id)
      setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))
    } catch {
      setError('We couldn’t update this notification. Please try again.')
    }
  }

  const loadOlder = () => { if (page < totalPages && !loadingMore) void load(page + 1, true) }

  return { items, total, loading, loadingMore, error, markingAll, markAllAsRead, markAsRead, loadOlder, retry: () => load(1, false), canLoadMore: page < totalPages }
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../../shared/api/services'
import { formatDateTime } from '../../shared/lib/format'
import { parseApiError } from '../../shared/lib/errors'
import { Button, EmptyState, ErrorState, Pill, SectionCard, Spinner } from '../../shared/ui/base'

export function NotificationsPage() {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return (
    <SectionCard
      title="Notifications"
      action={
        <Button
          variant="ghost"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
        >
          {markAllMutation.isPending ? 'Marking...' : 'Mark all as read'}
        </Button>
      }
    >
      {notificationsQuery.isLoading && <Spinner label="Loading notifications..." />}

      {notificationsQuery.isError && (
        <ErrorState message={parseApiError(notificationsQuery.error).message} />
      )}

      {markReadMutation.isError && (
        <ErrorState message={parseApiError(markReadMutation.error).message} />
      )}

      {markAllMutation.isError && (
        <ErrorState message={parseApiError(markAllMutation.error).message} />
      )}

      {notificationsQuery.isSuccess && notificationsQuery.data.length === 0 && (
        <EmptyState
          title="No notifications"
          subtitle="You are all caught up. New updates will appear here."
        />
      )}

      {notificationsQuery.isSuccess && notificationsQuery.data.length > 0 && (
        <ul className="space-y-3">
          {notificationsQuery.data.map((notification) => (
            <li
              key={notification.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{notification.message}</p>
                  <p className="mt-1 text-xs text-zinc-9500">{formatDateTime(notification.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={notification.isRead ? 'default' : 'warning'}>
                    {notification.isRead ? 'READ' : 'UNREAD'}
                  </Pill>
                  {!notification.isRead && (
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      onClick={() => markReadMutation.mutate(notification.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

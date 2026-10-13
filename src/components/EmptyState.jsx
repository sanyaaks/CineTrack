/** Friendly message with an icon and an optional call-to-action. */
export default function EmptyState({ icon: Icon, title, message, action, compact = false, tone }) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''} ${tone ? `empty-state--${tone}` : ''}`}>
      {Icon && (
        <span className="empty-state__icon">
          <Icon size={compact ? 22 : 30} aria-hidden="true" />
        </span>
      )}
      <h2 className="empty-state__title">{title}</h2>
      {message && <div className="empty-state__message">{message}</div>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

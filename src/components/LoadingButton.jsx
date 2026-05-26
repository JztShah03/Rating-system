export default function LoadingButton({ children, isLoading, loadingText = 'Loading...', ...props }) {
  return (
    <button className="button button--primary" disabled={isLoading || props.disabled} type="button" {...props}>
      {isLoading ? (
        <span className="button__loading">
          <span className="spinner" aria-hidden="true" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

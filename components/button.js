export default function Button ({ children, icon = false, ...props }) {
  return <>
    <button data-icon={icon} {...props}>{children}</button>

    <style jsx>{`
      button {
        padding: 4px 12px;
        border-radius: 8px;
        border: 2px solid var(--primary);
        background-color: transparent;
        color: var(--text);
        cursor: pointer;
        transition: transform 100ms;
      }
      
      button:hover { transform: translateY(-1px) }
      button:focus { outline: none }
      button[disabled] {
        opacity: 0.5;
        pointer-events: none;
      }

      button[data-icon='true'] {
        padding: 3px 3px 0 3px;
        border-radius: 6px;
      }
    `}</style>
  </>
}
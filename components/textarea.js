export default function Textarea ({ isDim = false, ...props }) {
  return <>
    <textarea data-dim={!!isDim} {...props}/>

    <style jsx>{`
      textarea {
        border-radius: 4px;
        border: 2px solid transparent;
        background-color: var(--surface);
        padding: 8px;
        cursor: pointer;
        transition: background-color 0.1s, opacity 0.1s;
        color: inherit;
        font-size: 14px;
        margin: 0 4px;
        text-overflow: ellipsis;
      }

      textarea:hover {
        background-color: var(--surface-highlight);
      }

      textarea:focus, textarea:active {
        border-color: var(--surface-bright);
        outline: none;
      }

      textarea[disabled] {
        opacity: 0.6;
        pointer-events: none;
      }

      textarea[data-dim='true'] { background-color: var(--surface-dim); }
    `}</style>
  </>
}

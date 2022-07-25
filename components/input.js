export default function Input ({ isDim = false, ...props }) {
  return <>
    <input data-dim={!!isDim} {...props}/>

    <style jsx>{`
      input {
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

      input:hover {
        background-color: var(--surface-highlight);
      }

      input:focus, input:active {
        border-color: var(--surface-bright);
        outline: none;
      }

      input[disabled] {
        opacity: 0.6;
        pointer-events: none;
      }

      input[data-dim='true'] { background-color: var(--surface-dim); }

      .input_large {
        font-size: 22px;
      }

      .input_label {
        line-height: 1.4;
      }
    `}</style>
  </>
}

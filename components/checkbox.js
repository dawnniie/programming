import { Check } from 'react-feather'

export default function Checkbox ({ value, onClick = () => {}, label, containerStyles = {}, disabled = false }) {
  return <>

    <div className='check-container' onClick={onClick} style={{ ...containerStyles, pointerEvents: disabled ? 'none' : '' }}>
      <div className='box' data-selected={Boolean(value).toString()} data-disabled={disabled}><Check size={16} strokeWidth={3}/></div>
      {label ? <p>{label}</p> : ''}
    </div>

    <style jsx>{`
      div.check-container {
        display: flex;
        align-items: center;
        margin: 0 12px;
      }

      div.box {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 2px solid var(--surface-bright);
        cursor: pointer;
        transition: background-color 0.1s, border-color 0.1s, opacity 0.1s;
      }

      div.box[data-selected='true'] {
        background-color: var(--kettu);
        border-color: var(--kettu);
      }

      div.box[data-disabled='true'] {
        opacity: 0.3;
        pointer-events: none;
      }

      div.box :global(svg) {
        opacity: 0;
        transition: opacity 0.1s;
        margin: 1px 0 0 0;
      }

      div.box[data-selected='true'] :global(svg) { opacity: 1; }

      p {
        margin: 0 8px;
        cursor: pointer;
      }
    `}</style>
  </>
}

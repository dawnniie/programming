import OriginalSelect from 'react-select'

const customStyles = ({ isSmall = false, isDim = false }) => ({
  control: (styles, state) => ({
    ...styles,
    boxShadow: 'none !important',
    backgroundColor: isDim ? 'var(--surface-dim)' : 'var(--surface)',
    borderWidth: '2px !important',
    borderColor: state.isFocused ? 'var(--surface-bright)' : 'transparent !important',
    minWidth: isSmall ? null : 160,
    height: isSmall ? 32 : 38,
    minHeight: 0,
    alignContent: 'center',
    width: 'fit-content',
    cursor: 'pointer',
    [state.isDisabled ? 'opacity' : null]: 0.6
  }),
  input: () => ({ fontFamily: 'var(--font)', color: 'var(--text)', fontSize: 14 }),
  singleValue: () => ({ fontFamily: 'var(--font)', color: 'var(--text)', fontSize: 14 }),
  valueContainer: def => ({ ...def, padding: isSmall ? '2px 2px 2px 6px' : '2px 8px', display: 'inherit' }),
  placeholder: () => ({ fontFamily: 'var(--font)', color: 'var(--text)', fontSize: 14 }),
  dropdownIndicator: def => ({ ...def, color: 'rgba(255, 255, 255, 0.4)', padding: isSmall ? 2 : 8, transform: isSmall ? 'scale(0.8)' : '' }),
  clearIndicator: def => ({ ...def, color: 'rgba(255, 255, 255, 0.4)' }),
  indicatorSeparator: def => ({ ...def, display: 'none' }),
  menu: def => ({ ...def, width: 'fit-content' }),
  option: (def, { isDisabled, isFocused, isSelected }) => ({
    ...def,
    backgroundColor: isDim ? (isFocused ? 'var(--surface)' : 'var(--surface-dim)') : (isFocused ? 'var(--surface-mid)' : 'var(--surface)'),
    opacity: isDisabled ? 0.6 : 1,
    color: 'inherit'
  }),
  groupHeading: def => ({ ...def, whiteSpace: 'nowrap' })
})

const customTheme = theme => ({
  ...theme,
  colors: {
    ...theme.colors,
    danger: 'var(--orangered)',
    dangerLight: '#2f2f2f',
    ...[100, 75, 50, 25].reduce((t, c) => ({ ...t, ['primary' + (c === 100 ? '' : c)]: 'var(--surface-bright)' }), {}),
    ...[0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90].reduce((t, c) => {
      const v = c / 100 * (255 - 19 - 100) + 19
      return { ...t, ['neutral' + c]: `rgba(${v}, ${v * 1.05}, ${v * 1.1})` }
    }, {})
  }
})

export default function Select (props) {
  return <OriginalSelect
    styles={customStyles(props)}
    theme={customTheme}
    {...props}
  />
}

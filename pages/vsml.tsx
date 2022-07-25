import { useState, useEffect, memo, BaseSyntheticEvent, SetStateAction, Dispatch } from 'react'
import { ArrowRight, ArrowUp, Check, ChevronLeft, ChevronsLeft, ChevronsRight, Divide, Download, GitBranch, GitCommit, MessageSquare, Minus, Monitor, Percent, Plus, RotateCcw, RotateCw, Shuffle, Terminal, Type, Upload, X, XOctagon } from 'react-feather'
import Button from '../components/button'
import Checkbox from '../components/checkbox'
import Input from '../components/input'
import Nav from '../components/nav'
import Select from '../components/select'
import Textarea from '../components/textarea'

const instructions = [
  { icon: XOctagon, code: 'HLT', description: 'Halt the program' },
  { icon: Upload, code: 'LDA', description: 'Load value from address into the accumulator' },
  { icon: Download, code: 'STA', description: 'Store accumulator value to address' },
  { icon: Plus, code: 'ADD', description: 'Add value from address to the accumulator' },
  { icon: Minus, code: 'SUB', description: 'Subtract value from address from the accumulator' },
  { icon: X, code: 'MUL', description: 'Multiply value from address into the accumulator' },
  { icon: Divide, code: 'DIV', description: 'Divide accumulator by value from address' },
  { icon: Percent, code: 'MOD', description: 'Modulus accumulator by value from address'},
  { icon: Shuffle, code: 'JMP', description: 'Jump to a certain address' },
  { icon: GitBranch, code: 'JEQ', description: 'Jump to address if accumulator is equal to zero' },
  { icon: ChevronLeft, code: 'JLT', description: 'Jump to address if accumulator is less than zero' },
  { icon: Monitor, code: 'OUT', description: 'Output integer value from address' },
  { icon: Type, code: 'OUA', description: 'Output ASCII value from address' },
  { icon: Terminal, code: 'INP', description: 'Input integer value (2\'s comp) to address' },
  { icon: MessageSquare, code: 'INA', description: 'Input string value (ASCII) to address' },
  { icon: ArrowUp, code: 'NOP', description: 'No operation, jump to next address' },

  { icon: Plus, code: 'ADDS', description: 'Add this location value to the accumulator' },
  { icon: Minus, code: 'SUBS', description: 'Subtract this location value from the accumulator' },
  { icon: X, code: 'MULS', description: 'Multiple this location value into the accumulator' },
  { icon: Divide, code: 'DIVS', description: 'Divide accumulator by this location value' },
  { icon: Percent, code: 'MODS', description: 'Modulus accumulator by this location value' },
  { icon: GitCommit, code: 'AND', description: 'AND accumulator with value from address' },
  { icon: GitCommit, code: 'OR', description: 'OR accumulator with value from address' },
  { icon: GitCommit, code: 'XOR', description: 'XOR accumulator with value from address' },
  { icon: GitCommit, code: 'NOT', description: 'NOT accumulator' },
  { icon: Plus, code: 'ADB', description: 'Binary add value from address to the accumulator, trimming off extra bits' },
  { icon: ChevronsRight, code: 'SHR', description: 'Bitshift accumulator n bits right (n = location value)' },
  { icon: ChevronsLeft, code: 'SHL', description: 'Bitshift accumulator n bits left (n = location value)' },
  { icon: RotateCw, code: 'ROR', description: 'Bitrotate accumulator n bits right (n = location value)' },
  { icon: RotateCcw, code: 'ROL', description: 'Bitrotate accumulator n bits left (n = location value)' },
  { icon: Check, code: 'CMP', description: 'Set accumulator to 1 if matching value from address (otherwise 0)' },
  { icon: Check, code: 'CMPS', description: 'Set accumulator to 1 if matching this location value' }
]

const samples = [
  { label: '16-bit number averager', id: 'average', notes: 'enter as many numbers as desired, and then enter -1 to calculate the average.' }
]

const instructionSets = [4n, 5n].map(v => ({ label: v + '-bit', value: v }))

const bigPow: (a: bigint, b: bigint) => bigint = eval('(a, b) => a ** b')

export default function VSML () {
  const [programCounter, setProgramCounter] = useState(0n)
  const [accumulator, setAccumulator] = useState(0n)
  const [archi, setArchi] = useState(16n)
  const [speed, setSpeed] = useState(4)
  const [instructionSet, setInstructionSet] = useState(4n)
  const [running, setRunning] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const [autoInput, setAutoInput] = useState(false)
  const [autoInputData, setAutoInputData] = useState('')
  const [output, setOutput] = useState('')

  const decToTcDec = (value: bigint): bigint => value - (value <= (bigPow(2n, (archi - 1n)) - 1n) ? 0n : bigPow(2n, archi))
  const tcDecToDec = (value: bigint): bigint => value + (value < 0n ? bigPow(2n, archi) : 0n)

  const [data, setData]: [bigint[], Dispatch<SetStateAction<bigint[]>>] = useState(new Array(16).fill(0n))
  const setDataItem = (index: bigint, valueOrFn: (bigint|Function)) => {
    setData((currentData: bigint[]) => {
      const newData = currentData.map((originalValue, i) => i === Number(index) ? (typeof valueOrFn === 'function' ? valueOrFn(originalValue) : valueOrFn) : originalValue)
      if (index < currentData.length) return newData
      else return newData.concat(new Array(Number(index) - currentData.length).fill(0n), typeof valueOrFn === 'function' ? valueOrFn(0n) : valueOrFn)
    })
  }

  const [locationEditing, setLocationEditing] = useState(null)
  const [locationEditingValue, setLocationEditingValue] = useState('')
  const [archiEditingValue, setArchiEditingValue] = useState(Number(archi))
  const [rowsToAdd, setRowsToAdd] = useState(16)

  useEffect(() => {
    const onClick = e => {
      if (locationEditing === null) return

      let tgt = e.target
      while (tgt.parentElement && !tgt.className.includes('byte')) tgt = tgt.parentElement

      setLocationEditing(null)
      if (tgt.tagName === 'HTML') setDataItem(locationEditing, value => (value >> (archi - instructionSet) << (archi - instructionSet)) + BigInt('0b' + locationEditingValue))
      else {
        const index = BigInt([...tgt.parentElement.childNodes].filter(k => k.className.includes('byte')).indexOf(tgt))
        if (index > bigPow(2n, (archi - instructionSet)) - 1n) return alert('Larger bit size architecture required to reach this address.')
        setDataItem(locationEditing, value => (value >> (archi - instructionSet) << (archi - instructionSet)) + index)
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [setDataItem, locationEditing, setLocationEditing, archi])

  function inBounds (value: bigint) {
    const min = -bigPow(2n, (archi - 1n))
    const max = bigPow(2n, (archi - 1n)) - 1n
    const size = bigPow(2n, archi)
    while (value > max) value -= size
    while (value < min) value += size
    return value
  }

  if (accumulator !== inBounds(accumulator)) setAccumulator(inBounds(accumulator))

  function runStep () {
    let value = data[Number(programCounter)]
    if (!value) {
      value = 0n
      setDataItem(programCounter, 0n)
    }

    const code = instructions[Number(value >> (archi - instructionSet))]?.code
    if (!code) { alert('Error: invalid instruction'); return false }

    const nonTargetIns = ['HLT', 'ADDS', 'SUBS', 'MULS', 'DIVS', 'MODS', 'NOT', 'ROR', 'ROL']
    const targetIndex = value & (bigPow(2n, (archi - instructionSet)) - 1n)
    let target = data[Number(targetIndex)]
    if (!target && !nonTargetIns.includes(code)) {
      target = 0n
      setDataItem(targetIndex, 0n)
    }

    switch (code) {
      case 'HLT': { alert('Program halted'); return false }
      case 'LDA': { setAccumulator(decToTcDec(target)); break }
      case 'STA': { setDataItem(targetIndex, tcDecToDec(accumulator)); break }
      case 'ADD': { setAccumulator(inBounds(accumulator + decToTcDec(target))); break }
      case 'SUB': { setAccumulator(inBounds(accumulator - decToTcDec(target))); break }
      case 'MUL': { setAccumulator(inBounds(accumulator * decToTcDec(target))); break }
      case 'DIV': { setAccumulator(inBounds(decToTcDec(target) === 0n ? 0n : accumulator / decToTcDec(target))); break }
      case 'MOD': { setAccumulator(inBounds(decToTcDec(target) === 0n ? 0n : accumulator % decToTcDec(target))); break }
      case 'JMP': { setProgramCounter(targetIndex); return true }
      case 'JEQ':
      case 'JLT':
        if ((code === 'JEQ' && accumulator === 0n)
          || (code === 'JLT' && accumulator < 0n)) {
          setProgramCounter(targetIndex)
          return true
        }
        break
      case 'OUT': { setOutput(output + decToTcDec(target) + '\n'); break }
      case 'OUA': {
        let bin = target.toString(2).padStart(Number(archi), '0')
        let out = ''
        while (bin.length >= 8) {
          const charCode = parseInt(bin.substring(bin.length - 8), 2)
          if (charCode !== 0) out = String.fromCharCode(charCode) + out
          bin = bin.substring(0, bin.length - 8)
        }
        setOutput(output + out + '\n')
        break
      }
      case 'INP': {
        const lim = bigPow(2n, (archi - 1n))
        if (autoInput) {
          let inp
          try { inp = BigInt(autoInputData.split('\n')[0]) } catch { inp = 0 }
          if (targetIndex === 0n) setAccumulator(tcDecToDec(inBounds(inp)))
          else setDataItem(targetIndex, tcDecToDec(inBounds(inp)))
          setAutoInputData(autoInputData.split('\n').slice(1).join('\n'))
        } else {
          let inp
          while (inp === undefined || inp === null) {
            try {
              const str = prompt(`Enter a number between -${lim.toString()} and ${(lim - 1n).toString()}. Numbers out of bounds will be wrapped.`, inp !== undefined ? 'Not a number' : '')
              if (str) inp = BigInt(str)
            } catch(e) { inp = null }
          }
          if (targetIndex === 0n) setAccumulator(tcDecToDec(inBounds(inp)))
          else setDataItem(targetIndex, tcDecToDec(inBounds(inp)))
        }
        break
      } case 'INA': {
        if (autoInput) {
          const maxLength = Math.floor(Number(archi) / 8)
          let val: any = autoInputData.split('\n')[0].substring(0, maxLength)
          setAutoInputData(autoInputData.replace(val, '').split('\n').filter(k => k).join('\n'))
          val = val.split('').map(k => k.charCodeAt(0)).map(k => k > (Math.pow(2, 7) - 1) ? 0 : k).reverse().map((v, i) => v << (i * 8)).reduce((t, v) => t + v, 0)
          if (targetIndex === 0n) setAccumulator(BigInt(val))
          else setDataItem(targetIndex, BigInt(val))
        } else {
          let val
          while (typeof val !== 'number') {
            val = prompt(`Enter a string of up to ${Math.floor(Number(archi) / 8)} ASCII characters.`, val !== undefined ? 'Invalid input' : '') || ''
            if (val.length > Math.floor(Number(archi) / 8)) continue
            val = val.split('').map(k => k.charCodeAt(0))
            if (val.find(v => v > (Math.pow(2, 7) - 1))) continue
            val = val.reverse().map((v, i) => v << (i * 8)).reduce((t, v) => t + v, 0)
          }
          if (targetIndex === 0n) setAccumulator(BigInt(val))
          else setDataItem(targetIndex, BigInt(val))
        }
        break
      }
      case 'ADDS': { setAccumulator(inBounds(accumulator + decToTcDec(targetIndex))); break }
      case 'SUBS': { setAccumulator(inBounds(accumulator - decToTcDec(targetIndex))); break }
      case 'MULS': { setAccumulator(inBounds(accumulator * decToTcDec(targetIndex))); break }
      case 'DIVS': { setAccumulator(inBounds(decToTcDec(targetIndex) === 0n ? 0n : accumulator / decToTcDec(targetIndex))); break }
      case 'MODS': { setAccumulator(inBounds(decToTcDec(targetIndex) === 0n ? 0n : accumulator % decToTcDec(targetIndex))); break }
      case 'AND': { setAccumulator(inBounds(decToTcDec(tcDecToDec(accumulator) & target))); break }
      case 'OR': { setAccumulator(inBounds(decToTcDec(tcDecToDec(accumulator) | target))); break }
      case 'XOR': { setAccumulator(inBounds(decToTcDec(tcDecToDec(accumulator) ^ target))); break }
      case 'NOT': { setAccumulator(inBounds(decToTcDec(BigInt('0b' + tcDecToDec(accumulator).toString(2).replace(/0/, '2').replace(/1/, '0').replace(/2/, '1'))))); break }
      case 'ADB': { setAccumulator(inBounds(decToTcDec((tcDecToDec(accumulator) + target) % bigPow(2n, archi)))); break }
      case 'SHR': { setAccumulator(inBounds(decToTcDec(tcDecToDec(accumulator) >> targetIndex))); break }
      case 'SHL': { setAccumulator(inBounds(decToTcDec(tcDecToDec(accumulator) << targetIndex))); break }
      case 'ROR': { setAccumulator(inBounds(((tcDecToDec(accumulator) & (bigPow(2n, targetIndex) - 1n)) << (archi - targetIndex)) + (tcDecToDec(accumulator) >> targetIndex))); break }
      case 'CMP': { setAccumulator(accumulator === target ? 1n : 0n); break }
      case 'CMPS': { setAccumulator(accumulator === decToTcDec(targetIndex) ? 1n : 0n); break }
    }

    setProgramCounter(programCounter + 1n)
    return true
  }

  useEffect(() => {
    const onShouldStep = () => {
      if (!running) return
      const result = runStep()
      if (result) setTimeout(() => window.dispatchEvent(new CustomEvent('_shouldStep')), 1000 / speed)
      else setRunning(false)
    }

    window.addEventListener('_shouldStep', onShouldStep)
    return () => window.removeEventListener('_shouldStep', onShouldStep)
  }, [running, setRunning, runStep, speed])

  useEffect(() => { running ? window.dispatchEvent(new CustomEvent('_shouldStep')) : null }, [running])

  return <>
    <Nav current='VSML'/>
    <p>VSML, or 'Very Simple Markup Language', is a low-level assembly-like language, helpful for understanding how binary code works on a very basic level.</p>
    <p>Try using the various instructions to move data around and perform basic operations. There are a few sample algorithms provided. <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide Extra' : 'Show More'} Info</span></p>
    {expanded && <>
      <p>Each row below is an 'address', with an address number and a value. An address can be used to store an executable instruction ('Instruction Mode') or for holding data ('Data Mode'). There is no actual distinction between the two for the processor, and it will execute any address it reaches in the program counter even if the value at that address is intended to be used for data storage. This means that instructions can be programmatically manipulated, but you have to be really careful about your logical flow to avoid bugs.</p>
      <p>When dealing with ASCII input and output, the ASCII bytes are stored in 8-bit segments of the address beginning from bit zero. Extra bits in the address won't be used.</p>
      <p>The 4-bit instruction set includes all necessary operations to write the majority of programs.</p>
      <p>The 5-bit instruction set simplifies some operations by providing direct arithmetic instructions and bitwise instructions. This is probably less realistic but more practical for ambitious programs.</p>
      <p>Try to select your instruction set and architecture before writing a program. Otherwise, data may be corrupted when changing, due to the instruction/data duality of addresses.</p>
    </>}

    <div className='across' style={{ gap: 64, justifyContent: 'center', marginTop: 48 }}>
      <div style={{ width: 'fit-content' }}>
        <p className='val'>Program Counter <strong>{programCounter.toString()}</strong></p>
        <p className='val'>Accumulator <strong>{tcDecToDec(accumulator).toString()}</strong></p>
        <p style={{ marginTop: -4, fontSize: archi <= 16 ? 14 : archi <= 32 ? 12 : 10, color: 'gray' }}>{accumulator.toString(2).padStart(Number(archi), '0')}</p>
        <div style={{ marginBottom: 28 }}/>
        <p>Architecture: <input type='range' min={8} max={64} value={archiEditingValue} onChange={e => setArchiEditingValue(Number(e.target.value))} onMouseUp={(e: BaseSyntheticEvent) => {
          if (e.target.value === archi) return

          const count = data.filter(value => (value >> (archi - instructionSet)) > 0).length
          const type = count > 0 ? prompt(`Changing architecture from ${archi}-bit to ${e.target.value}-bit will modify ${count} data bits as instruction mode (preserve instruction and pad/trim location). Provide a comma-separated list of bits to not modify if neccessary here, or cancel.`) : ''
          if (type === null) return setArchiEditingValue(Number(archi))

          const bits = type.split(',').map(k => k.trim()).filter(k => k).map(k => Number(k)).filter(k => typeof k === 'number')
          setData(data.map((value, i) => {
            if (bits.includes(i)) return value
            const ins = value >> (archi - instructionSet)
            if (ins === 0n) return value
            return (value & (bigPow(2n, (archi - instructionSet)) - 1n) & (bigPow(2n, (BigInt(e.target.value) - instructionSet)) - 1n)) + (ins << (BigInt(e.target.value) - instructionSet))
          }))

          setArchi(BigInt(e.target.value))
        }}/> ({archiEditingValue.toString()}-bit)</p>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Instruction set:
          <Select instanceId='is-select' isSmall isSearchable={false} options={instructionSets} value={instructionSets.find(s => s.value === instructionSet)} onChange={e => {
            if (e.value === instructionSet) return

            if (e.value > instructionSet) {
              const count = data.filter(value => ((value >> (archi - instructionSet - 1n)) & 1n) === 1n).length
              const type = count > 0 ? prompt(`Changing instruction set from ${instructionSet}-bit to ${e.value}-bit will modify ${count} data bits as instruction mode (preserving instruction and pad/trimming location). Provide a comma-separated list of bits to not modify if neccessary here, or cancel.`) : ''
              if (type === null) return
  
              const bits = type.split(',').map(k => k.trim()).filter(k => k).map(k => Number(k)).filter(k => typeof k === 'number')
              setData(data.map((value, i) => {
                if (bits.includes(i)) return value
                const ins = value >> (archi - instructionSet)
                if (ins === 0n) return value
                return (value & (bigPow(2n, (archi - instructionSet)) - 1n) & (bigPow(2n, (archi - BigInt(e.value))) - 1n)) + (ins << (archi - BigInt(e.value)))
              }))
            } else {
              const count = data.filter(value => (value >> (archi - instructionSet)) > 15n).length
              const type = count > 0 ? prompt(`Changing instruction set from ${instructionSet}-bit to ${e.value}-bit will modify ${count} data bits as instruction mode (trimming the instruction from ${instructionSet}-bit to ${e.value}-bit). Provide a comma-separated list of bits to not modify if neccessary here, or cancel.`) : ''
              if (type === null) return
  
              const bits = type.split(',').map(k => k.trim()).filter(k => k).map(k => Number(k)).filter(k => typeof k === 'number')
              setData(data.map((value, i) => {
                if (bits.includes(i)) return value
                const ins = value >> (archi - instructionSet)
                if (ins === 0n) return value
                return value - (ins << (archi - instructionSet)) + ((ins & (bigPow(2n, BigInt(e.value)) - 1n)) << (archi - e.value))
              }))
            }

            setInstructionSet(BigInt(e.value))
          }}/>
        </span>
        <p>Data range: {(archi <= 32 ? -bigPow(2n, (archi - 1n)) : `-2^${archi - 1n}`).toString()} → {(archi <= 32 ? bigPow(2n, (archi - 1n)) - 1n : `2^${archi - 1n} -1`).toString()} (2's complement)</p>
        <p>Address range: 1 → {(archi <= 32 ? bigPow(2n, (archi - instructionSet)) : `2^${archi - instructionSet}`).toString()} (unsigned)</p>
        <div style={{ marginBottom: 28 }}/>
        <p>Processor speed: <input type='range' min={Math.pow(1 / 1000, 1 / 4)} max={1} step={0.001} value={Math.pow(speed / 1000, 1 / 4)} onChange={(e: BaseSyntheticEvent) => setSpeed(Math.ceil(1000 * Math.pow(e.target.value, 4)))}/> ({speed}Hz)</p>

        <div className='across'>
          <Button onClick={() => {
            if (!data.find(i => i !== 0n)) return
            const conf = confirm('Are you sure you want to clear all data?')
            if (conf) {
              setData(new Array(16).fill(0n))
              setProgramCounter(0n)
              setAccumulator(0n)
            }
          }} disabled={running}>New</Button>
          <Button onClick={() => {
            setProgramCounter(0n)
            setAccumulator(0n)
          }} disabled={running}>Reset</Button>
          <Button onClick={() => runStep()} disabled={running}>Step</Button>
          <Button onClick={() => setRunning(!running)}>{running ? 'Stop' : 'Run'}</Button>
        </div>

        <div className='across' style={{ margin: '6px 0 8px 0' }}>
          <Button onClick={() => {
            const fileData = `v2;${instructionSet.toString()},${archi.toString()},${programCounter.toString(2)},${tcDecToDec(accumulator).toString(2)}\n${data.map(v => v.toString(2).padStart(Number(archi), '0')).join('\n')}`
            const a = document.createElement('a')
            a.href = URL.createObjectURL(new Blob([fileData]))
            a.download = (prompt('File name', 'program').trim() || 'program') + '.vsml'
            document.body.appendChild(a)
            a.click()
            setTimeout(() => {
              window.URL.revokeObjectURL(a.href)
              document.body.removeChild(a)
            })
          }}>Save</Button>
          <Button onClick={() => { const e: HTMLElement = document.querySelector('#fu'); e.click() }}>Load</Button>
          <input id='fu' type='file' style={{ display: 'none' }} onChange={() => {
            const elm: HTMLInputElement = document.querySelector('#fu')
            const file = elm.files?.[0]
            elm.value = ''
            if (!file) return

            const reader = new FileReader()
            reader.onload = ({ target }: ProgressEvent<FileReader>) => {
              const contents: string = target.result as string
              const version = contents.split(';')[0].replace('v', '')
              if (!['1', '2'].includes(version)) return alert('Unknown file format')

              if (version === '2') {
                const [_, is, arch, pc, acc] = contents.match(/^v2;(4|5),(\d+),([01]+),([01]+)/) || []
                if (!_) return alert('Corrupted file')
                setProgramCounter(BigInt('0b' + pc))
                setAccumulator(decToTcDec(BigInt('0b' + acc)))
                setInstructionSet(BigInt(is))
                setArchi(BigInt(arch))
                setData(contents.split('\n').slice(1).filter(k => k.trim()).map(v => { console.log(v); return BigInt('0b' + v) }))
              } else if (version === '1') {
                const [_, arch, pc, acc] = contents.match(/^v1;(\d+),(\d+),(\d+)/) || []
                setProgramCounter(BigInt(pc))
                setAccumulator(BigInt(acc))
                setInstructionSet(4n)
                setArchi(BigInt(arch))

                let blob = contents.split('\n')[1].split(''), items = []
                while (blob.length > 0) {
                  const seg = parseInt(blob.splice(0, Number(arch)).join(''), 2)
                  const v1ins = seg >>> (Number(arch) - 4)
                  const v2ins = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13][v1ins]
                  items.push(BigInt((seg & (Math.pow(2, Number(arch) - 4) - 1)) + (v2ins << (Number(arch) - 4))))
                }
                setData(items)
              }
            }

            reader.readAsText(file)
          }}/>
          <Select instanceId='sample-select' isSmall isSearchable={false} options={samples} value={null} placeholder='Load example' onChange={e => {
            fetch(`/samples/${e.id}.vsml`).then(res => res.text()).then(contents => {
              const [_, is, arch, pc, acc] = contents.match(/^v2;(4|5),(\d+),([01]+),([01]+)/) || []
              setProgramCounter(BigInt('0b' + pc))
              setAccumulator(decToTcDec(BigInt('0b' + acc)))
              setInstructionSet(BigInt(is))
              setArchi(BigInt(arch))
              setData(contents.split('\n').slice(1).map(v => BigInt('0b' + v)))
              alert('Sample loaded.\nInstructions: ' + e.notes)
            })
          }}/>

        </div>

        <Checkbox value={autoInput} onClick={() => setAutoInput(!autoInput)} label='Automatic Input Feed' containerStyles={{ margin: '12px 0' }}/>
        {autoInput ? <><Textarea value={autoInputData} onChange={e => setAutoInputData(e.target.value)} style={{ margin: '4px 0'}} placeholder='Input'/><br/></> : ''}
        <Textarea value={output} onChange={e => setOutput(e.target.value)} style={{ margin: '4px 0' }} placeholder='Output'/>
      </div>

      <div className='across' style={{ flexWrap: 'nowrap', gap: 16, justifyContent: 'center' }}>
        <div className='pointer' style={{ transform: `translateY(${67 + Number(programCounter) * 52}px)`, transition: `${800 / speed}ms` }}><ArrowRight color='var(--primary)'/></div>

        <table className={'dataset' + (locationEditing !== null ? ' is-selecting' : '')}>
          <tbody>
            <tr>
              <th colSpan={2}></th>
              <th colSpan={2}>Instruction Mode</th>
              <th colSpan={2}>Data Mode</th>
            </tr>

            <tr>
              <th>Addr</th>
              <th>Raw Bits</th>
              <th>Instruction</th>
              <th>Location</th>
              <th>Hex</th>
              <th>Dec</th>
            </tr>

            {data.map((value: bigint, i: number) => <AddressRow
              key={i}
              value={value}
              index={i}
              setSelf={d => setDataItem(BigInt(i), d)}
              archi={archi}
              instructionSet={instructionSet}
              locationEditing={locationEditing === i ? { value: locationEditingValue } : null}
              setLocationEditing={setLocationEditing}
              setLocationEditingValue={setLocationEditingValue}
              decToTcDec={decToTcDec}
              tcDecToDec={tcDecToDec}
            />)}

            <tr>
              <td colSpan={6}>
                Add
                <Input type='number' value={rowsToAdd} onChange={e => setRowsToAdd(Number(e.target.value))} style={{ width: 48, textAlign: 'center' }}/>
                rows...
                <Button icon style={{ marginLeft: 16 }} onClick={() => setData(data.concat(new Array(rowsToAdd).fill(0n)))}><Plus size={18}/></Button>  
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style jsx>{`
      .val strong {
        font-size: 24px;
        margin-left: 8px;
      }

      .dataset {
        border-collapse: separate;
        border-spacing: 0 8px;
      }

      .dataset th {
        font-weight: bold;
        font-size: 12px;
      }

      .dataset :global(td) {
        text-align: center;
        padding: 4px 16px;
      }

      .dataset :global(td) > :global(*) {
        display: inline-block;
        vertical-align: center;
      }

      .dataset :global(td):nth-child(3), .dataset :global(td):nth-child(5) { padding-right: 8px; }
      .dataset :global(td):nth-child(4), .dataset :global(td):nth-child(6) { padding-left: 8px; }

      .dataset :global(.byte) {
        height: 32px;
        outline: 1.5px solid var(--primary50);
        border-radius: 4px;
      }

      .dataset.is-selecting :global(.byte):hover {
        outline-color: var(--secondary);
      }

      :global(.instruction-item) {
        display: flex;
        flex-direction: column;
        gap: 4px;
        white-space: nowrap;
      }

      :global(.instruction-item > span) {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        margin-right: 4px;
      }

      :global(.instruction-item strong), :global(.instruction-item .desc) {
        font-size: 14px;
        margin: 0;
        text-align: left;
      }
    `}</style>
  </>
}

interface AddressRowProps {
  value: bigint;
  index: number;
  setSelf: Function;
  archi: bigint;
  instructionSet: bigint;
  locationEditing: { value: string };
  setLocationEditing: Function;
  setLocationEditingValue: Function;
  decToTcDec: Function;
  tcDecToDec: Function;
}

const AddressRow = memo(({ value, index: i, setSelf, archi, instructionSet, locationEditing, setLocationEditing, setLocationEditingValue, decToTcDec, tcDecToDec }: AddressRowProps) => {
  const [binaryEditing, setBinaryEditing] = useState(null)
  const [binaryEditingValue, setBinaryEditingValue] = useState('')

  const instruction = value >> (archi - instructionSet)
  const location = value & (bigPow(2n, (archi - instructionSet)) - 1n)

  return <tr className='byte'>
    <td>{i + 1}</td>
    <td><Input
      value={binaryEditing === i ? binaryEditingValue : value.toString(2).padStart(Number(archi), '0')}
      maxLength={Number(archi)}
      style={{ width: Math.min(Number(archi), 32) + 'ch' }}
      onFocus={e => { e.target.select(); setBinaryEditing(i); setBinaryEditingValue(e.target.value) }}
      onChange={e => {
        if (e.target.value.match(/^[01]*$/)) setBinaryEditingValue(e.target.value)
        else if (e.target.value.match(/^-?[0-9]*$/)) {
          const number = Number(e.target.value)
          if (number <= (bigPow(2n, (archi - 1n)) - 1n) && number >= -bigPow(2n, (archi - 1n)) || (e.target.value === '-')) setBinaryEditingValue(e.target.value)
        }
      }}
      onBlur={() => {
        setBinaryEditing(null)
        if (binaryEditingValue.match(/^[01]*$/)) setSelf(BigInt('0b' + binaryEditingValue) || 0n)
        else setSelf(binaryEditingValue === '-' ? 0n : tcDecToDec(BigInt(binaryEditingValue)))
      }}
    /></td>
    <td>
      <Select
        isSmall
        isSearchable={false}
        instanceId={'select-ins-' + i}
        value={instructions[Number(instruction)]}
        options={instructions.slice(0, Math.pow(2, Number(instructionSet)))}
        formatOptionLabel={(option, { context }) => {
          const Icon = option.icon
          return <span className='instruction-item'>
            <span><Icon size={context === 'menu' ? 16 : 20}/><strong>{option.code}</strong></span>
            {context === 'menu' ? <span className='desc'>{option.description}</span> : ''}
          </span>
        }}
        onChange={e => setSelf((BigInt(instructions.indexOf(e)) << (archi - instructionSet)) + location)}
      />
    </td>
    <td>
      <Input
        value={locationEditing?.value ?? location.toString(2).padStart(Number(archi - instructionSet), '0')}
        maxLength={archi - instructionSet}
        style={{ width: Math.min(Number(archi), 32) - Number(instructionSet) + 'ch' }}
        onClick={e => e.stopPropagation()}
        onFocus={e => { e.target.select(); setLocationEditing(i); setLocationEditingValue(e.target.value) }}
        onChange={e => setLocationEditingValue(e.target.value.match(/^[01]*$/) ? e.target.value : locationEditing.value)}
      />
      ({location.toString()})
    </td>
    <td>{value.toString(16)}</td>
    <td>{decToTcDec(value).toString()}</td>
  </tr>
}, ({ value, index, archi, locationEditing, instructionSet }, { value: valueNew, index: indexNew, archi: archiNew, locationEditing: locationEditingNew, instructionSet: newInstructionSet }) => {
  return value === valueNew && index === indexNew && archi === archiNew && locationEditing?.value === locationEditingNew?.value && instructionSet === newInstructionSet
})

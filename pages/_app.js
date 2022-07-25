import '../styles/fonts.css'
import '../styles/globals.css'
import Head from 'next/head'
import { useState, useEffect } from 'react'

function MyApp ({ Component, pageProps }) {
  const [layout, setLayout] = useState(calculateLayout())

  function calculateLayout() {
    let sw = 3
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 1000) sw = 2
      if (window.innerWidth <= 600) sw = 1
    }
    return sw
  }

  useEffect(() => window.addEventListener('resize', () => setLayout(calculateLayout())), [])
  useEffect(() => document.body.setAttribute('data-layout', layout))

  return <>
    <Head>
      <title>lachlanprogramming</title>
    </Head>

    <Component layout={layout} {...pageProps}/>
  </>
}

export default MyApp

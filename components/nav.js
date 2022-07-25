import Link from "next/link"
import { pages } from "../pages/index"

export default function Nav ({ isHome = false, current }) {

  return <div className='nav' style={isHome ? { justifyContent: 'center' } : {}}>
    <Link href='/'><h1>lachlan{'programming'.split('').map((c, i) => <span key={i} style={{ color: `hsl(160, 100%, ${44 + i * 4}%)` }}>{c}</span>)}</h1></Link>

    {!isHome ? pages.map((page, i) => <Link key={i} href={page.href}><a style={{ opacity: current === page.name ? 1 : null }}>{page.name}</a></Link>) : ''}

    <style jsx>{`
      .nav {
        padding: 12px 0;
        margin: 0 -8px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px;
      }

      .nav h1 {
        margin: 0 16px 0 0;
        cursor: pointer;
      }

      .nav a {
        opacity: 0.6;
      }

      .nav a:hover {
        opacity: 1;
      }
    `}</style>
  </div>
}

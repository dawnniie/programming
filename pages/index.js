import Nav from "../components/nav"

export const pages = [{ name: 'VSML', href: '/vsml', description: 'Very Simple Markup Language, a simple simulator for learning how the CPU fetch-execute cycle works.' }]

export default function Home () {
  return <>
    <Nav isHome/>
    <p>Various tools and resources for improving your programming skills and knowledge!</p>
    <p>There are always new tools under development, so make sure to check back occasionally.</p>

    <div className='pages'>
      {pages.map(page => <a href={page.href} className='page'>
        <h3>{page.name}</h3>
        <p>{page.description}</p>
      </a>)}
    </div>

    <style jsx>{`
      .pages {
        margin-top: 48px;
        justify-content: space-around;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 32px;
      }

      .page {
        padding: 16px 16px 8px 16px;
        border-radius: 16px;
        border: 2px solid var(--primary);
        text-align: center;
        max-width: 240px;
      }

      .page:hover {
        border-color: var(--primary50);
      }

      .page h3 { margin: 0; }

      p { text-align: center; }
    `}</style>
  </>
}

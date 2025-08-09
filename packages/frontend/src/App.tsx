import SiteHeader from "./siteHeader/siteHeader"
import MainContent from "./mainContent/mainContent"
import SiteFooter from "./siteFooter/siteFooter"

function App() {
  return (
    <>
      <header>
        <SiteHeader />
      </header>

      <main>
        <MainContent />
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </>
  )
}

export default App
import SiteHeader from "./siteHeader/siteHeader"
import MainContent from "./mainContent/mainContent"
import SiteFooter from "./siteFooter/siteFooter"
import "./App.css"

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
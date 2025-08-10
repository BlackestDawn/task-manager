import SiteHeader from "./siteHeader/siteHeader"
import SiteFooter from "./siteFooter/siteFooter"
import "./App.css"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <>
      <header>
        <SiteHeader />
      </header>

      <main>
        <RouterProvider router={router} />
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </>
  )
}

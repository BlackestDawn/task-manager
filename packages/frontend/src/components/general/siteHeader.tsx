import { checkAuthAction } from "@/lib/actions/auth";
import HeaderComponent from "./headerComponent";

export default async function SiteHeader() {
  const { isAuthenticated } = await checkAuthAction();

  return <HeaderComponent isAuthenticated={isAuthenticated} />;
}

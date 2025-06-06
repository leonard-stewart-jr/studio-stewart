import HeaderBar from "./HeaderBar";
import Sidebar from "./Sidebar";
import ISPSubNav from "./isp/isp-subnav";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();

  // Only show ISPSubNav on /independent-studio
  const isIndependentStudio = router.pathname === "/independent-studio";

  return (
    <>
      <HeaderBar />
      <Sidebar />
      {isIndependentStudio && <ISPSubNav />}
      <main>{children}</main>
    </>
  );
}

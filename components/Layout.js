import HeaderBar from "./HeaderBar";

export default function Layout({ children }) {
  return (
    <>
      <HeaderBar />
      <main>{children}</main>
    </>
  );
}

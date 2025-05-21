import { useState } from "react";
import SplashScreen from "../components/SplashScreen";
import NavBar from "../components/NavBar";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!showSplash && (
        <div>
          <NavBar />
          <main style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            borderRadius: 12,
            padding: '2rem',
            margin: '0 auto',
            maxWidth: 600,
            boxShadow: "0 4px 24px #eee"
          }}>
            <h1 style={{marginBottom: 10}}>Studio Stewart Portfolio</h1>
            <p style={{ fontSize: '1.2rem', textAlign: "center" }}>
              Welcome! Explore my creative work, projects, and expertise in web development, design, and 3D printing.
            </p>
            <ul style={{ marginTop: 28, textAlign: "left", fontSize: "1.1rem" }}>
              <li>🌐 Web Projects and Apps</li>
              <li>🎨 Custom Design and Branding</li>
              <li>🛠️ 3D Printing Innovations</li>
            </ul>
            <p style={{ marginTop: 32, color: "#666" }}>
              Want to collaborate? <a href="mailto:hello@studiostewart.com" style={{color: "#0070f3"}}>Contact me</a>
            </p>
          </main>
        </div>
      )}
    </>
  );
}

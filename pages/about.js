import NavBar from "../components/NavBar";

export default function About() {
  return (
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
        <h1>About Me</h1>
        <p style={{ fontSize: '1.1rem', textAlign: "center" }}>
          Hi! I'm Leonard Stewart Jr., a passionate creator, developer, and designer.<br /><br />
          I love building modern web experiences and experimenting with new technologies, including 3D printing!
        </p>
      </main>
    </div>
  );
}

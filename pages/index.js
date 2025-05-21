export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa'
    }}>
      <img
        src="/logo.png"
        alt="Logo"
        style={{ width: '180px', marginBottom: '2rem' }}
      />
      <h1>Welcome to Studio Stewart</h1>
      <p>Your Next.js project is set up and ready to go!</p>
    </main>
  );
}

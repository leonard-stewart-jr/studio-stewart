export default function About() {
    const containerStyle: React.CSSProperties = {
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
    };

    const titleStyle: React.CSSProperties = {
        color: "#bbb",
        fontSize: "2.5rem"
    };

    return (
        <main style={containerStyle}>
            <h1 style={titleStyle}>IN PROGRESS By Makashif</h1>
        </main>
    );
}

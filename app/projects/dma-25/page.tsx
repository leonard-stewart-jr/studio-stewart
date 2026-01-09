export default function DMA25ProjectPage() {
    const HEADER_HEIGHT = 76;

    const mainStyle: React.CSSProperties = {
        background: "#fff",
        paddingTop: HEADER_HEIGHT,
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const titleStyle: React.CSSProperties = {
        margin: 0,
        fontFamily: "coolvetica, sans-serif",
        fontSize: 28,
        letterSpacing: ".06em",
        color: "#181818",
    };

    return (
        <main style={mainStyle}>
            <h1 style={titleStyle}>IN PROGRESS</h1>
        </main>
    );
}

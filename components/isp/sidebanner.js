import styled from "styled-components";
export default function SideBanner({ text, color, side = "left" }) {
  return (
    <Banner color={color} side={side}>
      {text}
    </Banner>
  );
}
const Banner = styled.div`
  width: 80px;
  min-width: 60px;
  background: ${props => props.color};
  color: #fff;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
  font-weight: var(--weight-thin);
  font-size: 2rem;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  position: sticky;
  top: 60px;
  height: 100vh;
  left: ${props => (props.side === "left" ? 0 : "unset")};
  right: ${props => (props.side === "right" ? 0 : "unset")};
`;

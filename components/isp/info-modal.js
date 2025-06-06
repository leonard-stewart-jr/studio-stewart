import styled from "styled-components";
export default function InfoModal({ open, onClose, title, content }) {
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div>{content}</div>
        <button onClick={onClose}>Close</button>
      </ModalContainer>
    </Overlay>
  );
}
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 999;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
`;
const ModalContainer = styled.div`
  background: #fff; padding: 2rem; border-radius: 1rem; max-width: 460px; width: 90vw;
  max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 40px #2228;
  > button {
    margin-top: 2rem; padding: 0.5rem 1.5rem; border-radius: 8px; border: none;
    background: #b32c2c; color: #fff; font-weight: bold; cursor: pointer;
  }
`;

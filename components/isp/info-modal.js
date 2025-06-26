import styled from "styled-components";

// Accepts marker object with { name, timeline: [{ year, title, content, images, sources }] }
export default function InfoModal({ open, onClose, marker }) {
  if (!open || !marker) return null;

  // Find first event with sources, if any exist
  let sources = null;
  if (marker.timeline && marker.timeline.length > 0) {
    for (const event of marker.timeline) {
      if (event.sources && event.sources.length > 0) {
        sources = event.sources;
        break;
      }
    }
  }

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <h2>{marker.name}</h2>
        {marker.timeline && marker.timeline.length > 0 ? (
          <Timeline>
            {marker.timeline.map((event, idx) => (
              <TimelineEvent key={idx}>
                <EventHeader>
                  <EventYear>{event.year}</EventYear>
                  <EventTitle>{event.title}</EventTitle>
                </EventHeader>
                <EventContent>{event.content}</EventContent>
                {event.images && event.images.length > 0 && (
                  <ImageGrid>
                    {event.images.map((img, i) => (
                      <ImageWrap key={i}>
                        <img src={img.src} alt={img.caption} />
                        {img.caption && (
                          <ImageCaption>{img.caption}</ImageCaption>
                        )}
                      </ImageWrap>
                    ))}
                  </ImageGrid>
                )}
              </TimelineEvent>
            ))}
          </Timeline>
        ) : (
          <div>No timeline data available.</div>
        )}
        <CloseButton onClick={onClose}>Close</CloseButton>
        {sources && (
          <SourcesCorner>
            <span>Sources:</span>
            <ul>
              {sources.map((src, i) => (
                <li key={i}>
                  {src}
                </li>
              ))}
            </ul>
          </SourcesCorner>
        )}
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
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 540px;
  width: 96vw;
  max-height: 86vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px #2228;
  position: relative;
  > h2 {
    margin-top: 0;
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
    letter-spacing: 0.01em;
  }
  @media (max-width: 600px) {
    padding: 1.1rem 0.6rem 1.4rem 0.6rem;
    max-width: 100vw;
    width: 100vw;
    max-height: 99vh;
    border-radius: 0.7rem;
    > h2 {
      font-size: 1.2rem;
      margin-bottom: 0.7rem;
    }
  }
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
  @media (max-width: 600px) {
    gap: 1.2rem;
  }
`;

const TimelineEvent = styled.div`
  border-left: 3px solid #b32c2c;
  padding-left: 1.2rem;
  margin-bottom: 0.7rem;
  @media (max-width: 600px) {
    padding-left: 0.7rem;
    font-size: 0.97em;
  }
`;

const EventHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }
`;

const EventYear = styled.div`
  font-size: 1.08em;
  color: #b1b1ae;
  font-weight: 700;
  letter-spacing: 0.02em;
  min-width: 80px;
  @media (max-width: 600px) {
    font-size: 1.01em;
    min-width: unset;
  }
`;

const EventTitle = styled.div`
  font-weight: 600;
  font-size: 1.15em;
  color: #181818;
  @media (max-width: 600px) {
    font-size: 1.02em;
  }
`;

const EventContent = styled.div`
  font-size: 1em;
  color: #333;
  margin-bottom: 0.5rem;
  margin-top: 0.3rem;
  @media (max-width: 600px) {
    font-size: 0.98em;
  }
`;

const ImageGrid = styled.div`
  display: flex;
  gap: 11px;
  flex-wrap: wrap;
  margin-top: 0.55rem;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 7px;
    align-items: flex-start;
  }
`;

const ImageWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 140px;
  > img {
    width: 100%;
    max-width: 140px;
    border-radius: 8px;
    box-shadow: 0 1.5px 6px #3333;
    margin-bottom: 3px;
  }
  @media (max-width: 600px) {
    max-width: 96vw;
    > img {
      max-width: 96vw;
    }
  }
`;

const ImageCaption = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 0.5px;
  line-height: 1.2;
  @media (max-width: 600px) {
    font-size: 13px;
  }
`;

const CloseButton = styled.button`
  margin-top: 2.4rem;
  padding: 0.6rem 2rem;
  border-radius: 10px;
  border: none;
  background: #b32c2c;
  color: #fff;
  font-weight: bold;
  font-size: 1.15em;
  cursor: pointer;
  transition: background 0.16s;
  &:hover, &:focus {
    background: #a12020;
  }
  @media (max-width: 600px) {
    margin-top: 1.3rem;
    width: 100%;
    font-size: 1.11em;
    padding: 0.95rem 0;
  }
`;

const SourcesCorner = styled.div`
  position: absolute;
  bottom: 16px;
  right: 22px;
  background: rgba(255,255,255,0.94);
  color: #7c7c7c;
  font-size: 11px;
  border-radius: 8px;
  padding: 8px 14px 8px 10px;
  max-width: 220px;
  box-shadow: 0 2px 8px #b1b1ae33;
  opacity: 0.9;
  z-index: 20;
  pointer-events: auto;
  ul {
    margin: 0.3em 0 0 0;
    padding-left: 13px;
    list-style: disc;
  }
  span {
    font-weight: bold;
    color: #b32c2c;
    font-size: 12px;
    margin-right: 5px;
  }
`;

// Two world locations, each with a full timeline array, rich text, and placeholder images/captions
export default [
  {
    name: "Mesopotamian Detention Practices",
    lat: 33.3152,
    lon: 44.3661, // Baghdad, Iraq (approx Mesopotamia)
    timeline: [
      {
        year: "c. 2000 BCE",
        title: "Mesopotamian Detention Practices",
        content:
          "Earliest records of imprisonment as a temporary holding before punishment. Detention was not used for long-term punishment, but rather as a means to hold individuals until their fate was decided by authorities.",
        images: [
          {
            src: "/images/isp/cuneiform-tablet.jpg",
            caption: "Cuneiform tablet describing early legal codes."
          },
          {
            src: "/images/isp/ziggurat-render.jpg",
            caption: "Artist's rendering of a ziggurat, the center of Mesopotamian cities."
          },
          {
            src: "/images/isp/early-holding-chamber.jpg",
            caption: "Reconstruction of an early holding chamber."
          }
        ]
      }
    ]
  },
  {
    name: "Tower of London",
    lat: 51.5081,
    lon: -0.0759,
    timeline: [
      {
        year: "11th Century",
        title: "Tower of London as a Prison",
        content:
          "The Tower of London was used to detain royalty, religious dissenters, and political prisoners. Over the centuries, it became a symbol of state power and the evolving concept of incarceration.",
        images: [
          {
            src: "/images/isp/tower-over-time.jpg",
            caption: "The Tower of London through the centuries."
          },
          {
            src: "/images/isp/tower-interior.jpg",
            caption: "Interiors where prisoners were held."
          },
          {
            src: "/images/isp/tower-execution-site.jpg",
            caption: "Execution site at the Tower."
          }
        ]
      },
      {
        year: "1557",
        title: "Maison de Force (Ghent, Belgium)",
        content:
          "One of the first purpose-built reform prisons. Emphasized rehabilitation over punishment through labor and discipline.",
        images: [
          {
            src: "/images/isp/maison-engraving.jpg",
            caption: "Engraving of Maison de Force."
          },
          {
            src: "/images/isp/maison-uniforms.jpg",
            caption: "Flemish penal uniforms."
          }
        ]
      },
      {
        year: "1791",
        title: "Panopticon Theory by Jeremy Bentham",
        content:
          "Bentham's Panopticon design introduced the idea of constant surveillance as a tool for control and reform. While never fully realized, its concept influenced prison architecture globally.",
        images: [
          {
            src: "/images/isp/panopticon-diagram.jpg",
            caption: "Diagram of Bentham's Panopticon."
          },
          {
            src: "/images/isp/panopticon-sketch.jpg",
            caption: "Conceptual sketch of a surveillance-based prison."
          }
        ]
      }
    ]
  }
];

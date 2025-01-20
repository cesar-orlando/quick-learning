export const mexicoTopoJson = {
  type: "Topology",
  arcs: [
    [[-103, 20], [-104, 20], [-104, 21], [-103, 21], [-103, 20]], // Jalisco
    [[-100, 19], [-101, 19], [-101, 20], [-100, 20], [-100, 19]], // México
    [[-100, 25], [-101, 25], [-101, 26], [-100, 26], [-100, 25]], // Nuevo León
  ],
  objects: {
    states: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          arcs: [[0]],
          properties: { name: "Jalisco" },
        },
        {
          type: "Polygon",
          arcs: [[1]],
          properties: { name: "México" },
        },
        {
          type: "Polygon",
          arcs: [[2]],
          properties: { name: "Nuevo León" },
        },
      ],
    },
  },
  transform: {
    scale: [0.5, 0.5], // Escala ajustada
    translate: [-110, 15], // Centrado aproximado para México
  },
};

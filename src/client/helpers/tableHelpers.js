export const handPosition = (scene, playerId) => {
  var { width, height } = scene.cameras.main;
  switch (playerId) {
    case 0:
      return { x: width / 2, y: height - 110 };
    case 1:
      return { x: 110, y: height / 2 };
    case 2:
      return { x: width / 2, y: 110 };
    case 3:
      return { x: width - 110, y: height / 2 };
    default:
      break;
  }
};

export const scoreTextPosition = (scene, playerId) => {
  var { width, height } = scene.cameras.main;
  switch (playerId) {
    case 0:
      return { x: width / 2 - 300, y: height - 250 };
    case 1:
      return { x: 10, y: 70 };
    case 2:
      return { x: width / 2 - 300, y: 230 };
    case 3:
      return { x: width - 210, y: 70 };
    default:
      break;
  }
};

export default class AnimatedImages {
  constructor(scene) {
    this.scene = scene;

    this.createBg();
    this.prepareAstronauts();
    this.scene.events.on('update', () => {
      this.updateBg();
      this.animateAstronauts();
    })
	}

  createBg() {
    this.iter = 0;
    this.starsBg = this.scene.add.tileSprite(0, 0, 0, 0, 'starsBg');
  }

  updateBg() {
    this.starsBg.tilePositionX = (this.iter) * 100;
    this.starsBg.tilePositionY = (this.iter) * 150;
    this.iter += 0.01;
  }

  prepareAstronauts() {
    var { width, height } = this.scene.cameras.main;
    this.astronauts = [];
    this.prepareAstronaut(1, width - 100, height - 200);
    this.prepareAstronaut(2, 100, 200);

  }

  prepareAstronaut(index, width, height) {
    var astronaut = this.scene.add.image(width, height, `astronaut${index}`)
    astronaut.setDisplaySize(astronaut.width * 0.3,
                                  astronaut.height * 0.3);

    var tween = this.scene.tweens.addCounter({
      from: -1,
      to: 1,
      duration: Math.floor(Math.random() * 800 + 700),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.astronauts.push({
      image: astronaut,
      tween: tween,
      tweenDirection: index != 1 ? 'x' : 'y'
    })
  }

  animateAstronauts() {
    this.astronauts.forEach(astronaut => {
      var { image, tween, tweenDirection } = astronaut;
      image[tweenDirection] = image[tweenDirection] + tween.getValue();
    })
  }
}

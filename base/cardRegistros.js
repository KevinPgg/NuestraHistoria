import { Card } from '../model/card.js';

const photoData = [
  {
    filename: 'ale.jpg',
    descripcion: 'Alejandra preciosa con un pump lipstick delicioso ... digo lindo, hermoso, precioso, mi amor, mi novia, mi todo, mi vida, mi corazón jeje sapa',
    fecha: '2025-05-02T13:36:14.778910+00:00'
  },
  {
    filename: 'aleyo.jpg',
    descripcion: 'Foto en el espejo del mall del sol, comida y primer regalo O:',
    fecha: '2025-06-29T08:43:52.282095+00:00'
  },
  {
    filename: 'aleyopanora.jpg',
    descripcion: 'Alejandra y Kevin en panoramix, momento de lanzar vejigas con pintura y romper cosas muajaja',
    fecha: '2025-06-07T23:06:26.861937+00:00'
  },
  {
    filename: 'aleyotop.jpg',
    descripcion: 'Foto en el otro espejo del mall del sol jajaja kevin salió wapote',
    fecha: '2025-06-29T08:42:56.308116+00:00'
  },
  {
    filename: 'canela.jpg',
    descripcion: 'Comidita en SportGarden y los pan de canela en SecretRoll ulala, bacon-honey, nutella, tradicional y nutella',
    fecha: '2025-06-21T21:45:47.329646+00:00'
  },
  {
    filename: 'payaso.jpg',
    descripcion: 'Foto desprevenida cuando comimos pizza con los chicos y alex jsjjs',
    fecha: '2025-06-29T08:36:59.370209+00:00'
  },
  {
    filename: 'yo.jpg',
    descripcion: 'Foto mia de kevin en un restaurant de ramen haciendo una pose kawai >.< nya!',
    fecha: '2025-05-11T19:00:47.340279+00:00'
  },
  {
    filename: 'ale-alealesita.jpg',
    descripcion: 'Ale alesita foto de perfil linda, muaks 💋💋',
    fecha: '2025-09-28T19:54:04.443007+00:00'
  },
  {
    filename: 'ale-barba.jpg',
    descripcion: 'Alejandra practicando para su rol de bagabundo/homeless, si le sale el papel #homeless#zuricataslavanos🙏',
    fecha: '2025-11-03T08:18:50.746923+00:00'
  },
  {
    filename: 'ale-cumple-giftsetup.jpg',
    descripcion: 'el setup del regalo de cumpleaños que me dió mi novia preciosa 😭',
    fecha: '2025-11-04T10:21:00.330673+00:00'
  },
  {
    filename: 'ale-darkera.jpg',
    descripcion: 'Alejandra en su etapa emo, se escapaba de casa 1 vez cada dos semanas porque no apayaban su sueño de ser youtuber y su canal de imichi no ganaba vistas 😞',
    fecha: '2025-10-06T21:40:38.222183+00:00'
  },
  {
    filename: 'ale-erahumilde.jpg',
    descripcion: 'Momento humilda de mi novia preciosa cuando se expuso a llorar en vivo por un trend jajajjaja te amo mi amorcitop ❤️',
    fecha: '2025-11-09T23:26:15.809031+00:00'
  },
  {
    filename: 'ale-eresrara.jpg',
    descripcion: 'Foto atesorada de mi corazon ... tiene gustos raros pero que se puede hacer la amo',
    fecha: '2025-11-23T23:16:10.725909+00:00'
  },
  {
    filename: 'aleyo-beforedanny.jpg',
    descripcion: 'Foto obligada porque alejandra estaba molesta conmigo por llegar tarde jiji 😅, se nota como yo(kevin) parece tener labial y alejandra no ... pura coincidencia 👀, la cama desordenada también es coincidencia',
    fecha: '2025-09-14T13:04:26.011091+00:00'
  },
  {
    filename: 'ale-floresamarillas.jpg',
    descripcion: 'Girasoles amarillos (tus favoritos mi amor 💛) para el 21 de septiembre, y con tus flores amarillaaaaaas',
    fecha: '2025-09-21T16:14:02.250971+00:00'
  },
  {
    filename: 'ale-leona.jpg',
    descripcion: 'Grr amorcito estas cansadita pero igual estas preciosa, pareces una leonsita jajja te amo sapa',
    fecha: '2025-11-25T22:47:22.471636+00:00'
  },
  {
    filename: 'ale-policia.jpg',
    descripcion: '😳😳😳😳😳 de ti si me dejo esposar',
    fecha: '2025-11-02T13:57:24.659773+00:00'
  },
  {
    filename: 'ale-waparubia.jpg',
    descripcion: 'Alejandra saliendo de algún sitio quien sabe donde pero está linda *ñam te como toda. amor te me haces muy sexi en esa foto. Todo me palpita*',
    fecha: '2025-11-16T21:22:33.404191+00:00'
  },
  {
    filename: 'aleyo-caras.jpg',
    descripcion: 'Pareja de locos hacinedo caras locas, a la izquierda vemos a alejandra viviendo su mejor vida jajaj <3',
    fecha: '2025-10-19T18:48:36.095357+00:00'
  },
  {
    filename: 'aleyo-casares.png',
    descripcion: 'Fotito comeindo en casares, Felices 6 Meses!!! Muacks mi amor ❤️ somos unos crack para lass relaciones 😎',
    fecha: '2025-11-30T21:18:05.274243+00:00'
  },
  {
    filename: 'aleyo-cochinos2.jpg',
    descripcion: 'Emmmm .... nada que ver sigue scrolleando 😳',
    fecha: '2025-10-19T18:48:52.354490+00:00'
  },
  {
    filename: 'aleyo-cochinos.jpg',
    descripcion: 'Esta es mas suave jeje un besito tierno',
    fecha: '2025-10-19T18:48:54.873399+00:00'
  },
  {
    filename: 'aleyo-cumpleale-loquitos1.jpg',
    descripcion: 'Cumpleaños de alejandrita 22años Foto en honor a la sonrisa de la prima de ale jajjajaj, mi amor estas gapisima O;',
    fecha: '2025-10-06T21:40:49.541114+00:00'
  },
  {
    filename: 'aleyo-cumpleale-loquitos2.jpg',
    descripcion: 'Cumpleaños de alejandrita 22años en la cocina jejeje only tenderness',
    fecha: '2025-10-06T21:40:47.314975+00:00'
  },
  {
    filename: 'aleyo-dannyocean.jpg',
    descripcion: 'Concierto daniel oceano, estaba chevere. Alejandra la pasó increible jsjs se quedó muda mi amor gritando por otro hombre en frente de mi 😠😠 una grosera',
    fecha: '2025-09-14T13:04:25.606184+00:00'
  },
  {
    filename: 'aleyo-gorra.jpg',
    descripcion: 'After gym, gorra evita-verguenzas. Me rapé por "accidente" 👀👀',
    fecha: '2025-10-26T13:55:15.272466+00:00'
  },
  {
    filename: 'aleyo-gym.jpg',
    descripcion: 'Foto en el gym, primera vez en el gym, mmmmm no es la mejor foto jsjs',
    fecha: '2025-11-30T21:33:44.129019+00:00'
  },
  {
    filename: 'aleyo-happymoment1.jpg',
    descripcion: 'Cita en Tania`s Café, hicimos tacitas y nos nos tomamos fotos. Aquí alejandra se enamoró más de mí 😳😳😳😳😳',
    fecha: '2025-11-05T20:43:34.800227+00:00'
  },
  {
    filename: 'aleyo-jejeje-mascarilla.jpg',
    descripcion: 'AirBnb para pasar el rato *guiño guiño 🫦🔥*, anyways mascarilla humectante y baño bonito  👌',
    fecha: '2025-10-11T13:27:20.291860+00:00'
  },
  {
    filename: 'aleyo-jejeje.jpg',
    descripcion: 'jejeje en un lugar jejeje airbnb baño, outfit pelao sambo short hasta encima de la rodilla',
    fecha: '2025-10-11T13:27:20.458944+00:00'
  },
  {
    filename: 'aleyo-patos.jpg',
    descripcion: 'Mi amorcito y yo haciendo como patos en uno de las pijamadas jeje',
    fecha: '2025-10-19T18:48:50.059004+00:00'
  },
  {
    filename: 'aleyo-placidez.jpg',
    descripcion: 'Fotito top, salí con una sonrisota, alejandra esta lindota 😭 y los recuerdos de las estrellitas anti acné',
    fecha: '2025-10-19T21:12:00.354680+00:00'
  },
  {
    filename: 'aleyo-placidez2.jpg',
    descripcion: 'Foto de felicidad, alejandra no supo hasta los 6 meses que tenía una cicatriz en el labio jsjs',
    fecha: '2025-10-19T21:07:43.767285+00:00'
  },
  {
    filename: 'aleyo-portones.jpg',
    descripcion: 'Yo (Kevin) y una fan tomandose una foto sin mi consentimiento ni aprobación, una clara violación a mis derechos constitucionales e integridad como humano pero como estaba linda y tierna la dejé',
    fecha: '2025-07-12T13:16:14.239408+00:00'
  },
  {
    filename: 'aleyo-promise.jpg',
    descripcion: 'Primera foto que subo a estados *whatsapp* demostrando mi relación y promesa con quien sería mi linda noviecilla actual aka. sapa',
    fecha: '2025-09-14T13:04:23.498439+00:00'
  },
  {
    filename: 'aleyo-skincare.jpg',
    descripcion: 'Primer skincare luego del concierto del daniel oceano, no tenemos foto pero nos comimos un choclo asado al salir del concierto, yo me pedi mollejas jejeje',
    fecha: '2025-09-14T13:04:25.218262+00:00'
  },
  {
    filename: 'alyo-casares-6m-muack.jpg',
    descripcion: 'Casa res foto de beso, corte de maliante oyite bb brrrr',
    fecha: '2025-11-30T21:11:28.283137+00:00'
  },
  {
    filename: 'alyo-casares-6m.jpg',
    descripcion: 'Casa res fotoito, alejandra salió wapisima wtf O: 😍😍 yo sali con mi ojo vago jsjsj',
    fecha: '2025-11-30T21:11:30.069388+00:00'
  },
  {
    filename: 'merhaba.jpg',
    descripcion: 'El icónico merhaba, que no hago yo por hacer feliz a mi mujer, mi niña, mi princesa, al amor de mi vida. En fin me quise parecer a los turcos merhaba signfica familia digo hola',
    fecha: '2025-08-29T22:21:09.447625+00:00'
  },
  {
    filename: 'provolatta.jpg',
    descripcion: 'No estamos ninguno de los wapos (mi amorcito y yo) pero ese queso provolone y burrata estaba bestial, con pan de ajo quedó muy yuuuuuumi yum like yumi yum.',
    fecha: '2025-11-30T21:11:31.477113+00:00'
  },
  {
    filename: 'suchi.jpg',
    descripcion: 'Sushi en noe sushi luego de una sesion de ejercicio dura *(no fue lo único que se endureció)*, unos besos apasionados y full sudor. Un buen merecido sushi, hubo un show con fuego y saque para unos rollos 8/10 debía ser de noche para apreciarse mejor pipipi',
    fecha: '2025-08-24T15:10:12.999297+00:00'
  },
  {
    filename: 'yo-cerofetiche.jpg',
    descripcion: 'Foto para mi novia que solo me busca por mi esculpido cuerpo, calor natural a hombre y confort de confianza ... *censura en las axilas xq alejandrita tiene fetiches :p*',
    fecha: '2025-11-15T19:55:06.710219+00:00'
  },
  {
    filename: 'yo-corteintento1000.jpg',
    descripcion: 'El propietario de este Blog/PaginaWeb/PortalDeMeseversario/ElAmorDeTuVida en su intento numero 10x10^10000 de cortarse el pelo solo',
    fecha: '2025-08-31T18:08:27.456809+00:00'
  },
  {
    filename: 'aleyo-hailmary1.jpeg',
    descripcion: 'A: Después de ver Project Hail Mary 👎😭 post chillada , que lindo fue verte sensible jsjsjs no había visto tan cerca ese tú 🫂',
    fecha: '2026-04-10T00:00:00+00:00'
  },
  {
    filename: 'aleyo-hailmary2.jpeg',
    descripcion: 'Bueno si con esta foto alguien duda de que te amo mi amor entonces están ciegos, y como dice el rocky ... no es suficiente :c',
    fecha: '2026-04-10T00:00:00+00:00'
  },
  {
    filename: 'aleyo-jardinbotanico2.jpeg',
    descripcion: 'Yo amo la comida y a mi novia, por suerte en esta foto podemos ver que me puedo comer ambas 😍',
    fecha: '2026-01-31T00:00:00+00:00'
  },
  {
    filename: 'aleyo-jaridnbotanico1.jpeg',
    descripcion: 'Foto todos guapos ante de que nos coma una manada rabiosa de mosquitos',
    fecha: '2026-01-31T00:00:00+00:00'
  },
  {
    filename: 'aleyo-laser1.jpeg',
    descripcion: 'A: Parece que alguien está recargándose JAAJ pero es el efecto nomás. Ese día estábamos guapotes',
    fecha: '2026-04-04T00:00:00+00:00'
  },
  {
    filename: 'aleyo-lluviachifa.jpeg',
    descripcion: 'A: Día épico amore mío después de correr en la lluvia y darnos besitos fue lindisimoooo , Disney momento en mi mente jssjs te amo',
    fecha: '2026-02-20T00:00:00+00:00'
  },
  {
    filename: 'aleyo-parquehistorico1.jpeg',
    descripcion: 'A: Parque histórico salidita 😛 te ves chinito de sonreír 😍 agarrando lo que te pertenece (o sea yo)😠☝️',
    fecha: '2026-05-02T00:00:00+00:00'
  },
  {
    filename: 'aleyo-parquehistorico2.jpeg',
    descripcion: 'Foto obligada digo tomada con mucho amor, 1/20 fotos creo jajaja',
    fecha: '2026-05-02T00:00:00+00:00'
  },
  {
    filename: 'aleyo-skincare1.jpeg',
    descripcion: 'A: JAJAJA alguien tenía una carita de satisfacción única , creo saber dónde estaba su mano',
    fecha: '2026-02-01T00:00:00+00:00'
  },
  {
    filename: 'ale-vascalove.jpg',
    descripcion: 'Alejandra me regaló una torta vasca de cumpleaños 🥺 como no me iba a enamorar',
    fecha: '2025-11-04T15:18:52.639510+00:00'
  },
  {
    filename: 'alemichi.jpg',
    descripcion: 'Ida al parque de la kenedy, habian full gatitos. Hermoso día donde alejandra se enteró que los gatos tienen personalidad jajaja',
    fecha: '2025-05-24T00:00:00+00:00'
  },
  {
    filename: 'alerojo.jpg',
    descripcion: 'De rojo de te ves demasiado bien 😳',
    fecha: '2025-06-02T05:11:46.573258+00:00'
  },
  {
    filename: 'aleyo-casatia1.jpeg',
    descripcion: 'A: Y ese pucheritoooo😭😭😍😍😍 basta me dio un ataque de amor lol',
    fecha: '2026-03-06T00:00:00+00:00'
  },
  {
    filename: 'aleyo-comidamexa1.jpeg',
    descripcion: 'A: Cumpleaños de Lina la dimos toda amor , me encanta todo contigo y si quisiste bailar (indispensable para mí en una pareja) aparte fuiste mi Barbie JAJAJA Tini Tini Tini muaksss',
    fecha: '2026-01-31T00:00:00+00:00'
  },
  {
    filename: 'aleyo-skincare2.jpeg',
    descripcion: 'skincare pero desde el espejo como todo un divo',
    fecha: '2026-02-01T00:00:00+00:00'
  },
  {
    filename: 'yo-presodetuslabiosamor.jpeg',
    descripcion: 'Aqui luciendo mi corte de reo con un filtro de fuckboy ',
    fecha: '2026-10-30T00:00:00+00:00'
  },
  {
    filename: 'yo-hailhitler.jpg',
    descripcion: 'Foto imitando a los seguidores y al que no debe ser nombrado. ------------------------------------------------------------------------Pista: jabón-----------------------------------------------------',
    fecha: '2025-09-21T00:22:50.479224+00:00'
  },
  {
    filename: 'yo-paratisapa2.jpg',
    descripcion: 'No sé en que estaba pensando cuando incluí esa foto aquí pero bueno mostrando la barbita  😳',
    fecha: '2025-10-14T23:17:58.232725+00:00'
  },
  {
    filename: 'yo-paratisapa.jpg',
    descripcion: 'Foto de varias fotos las cuales le regalé a mi novia porque ese día estaba especialmente linda, el michi es un filtro jsjsjs está cool',
    fecha: '2025-11-23T23:16:04.300628+00:00'
  },
  {
    filename: 'yo-pumplips.jpg',
    descripcion: 'Estoy yo luego de samparme varias cucharadas de ají (oil chilli flakes) producto estrella de mis ajíes pero si que me inchó los labio diomio.',
    fecha: '2025-10-26T13:55:21.698681+00:00'
  },
  {
    filename: 'ale-playa001.jpeg',
    descripcion: 'Alejandra enviandome fotos de su viaje a la playa?',
    fecha: '2025-05-02T10:35:06+00:00'
  },
  {
    filename: 'ale-elgranteo.jpeg',
    descripcion: 'cumplea;os del gran teo, Alejandra no fue jsjs',
    fecha: '2025-04-27T00:17:37+00:00'
  },
  {
    filename: 'ale-vino.jpeg',
    descripcion: 'mi novia bella mareandose con una sangria',
    fecha: '2025-04-25T22:48:10+00:00'
  },
  {
    filename: 'kevin-maikimoramen.jpeg',
    descripcion: 'ramen criollo? jsjs picante del diavlo',
    fecha: '2025-05-10T22:46:33+00:00'
  },
  {
    filename: 'kevin-pendejo.jpeg',
    descripcion: 'mmmm no hablemos de eso',
    fecha: '2025-05-11T19:13:35+00:00'
  },
  {
    filename: 'ale-remedioslocos.jpeg',
    descripcion: 'una loquita con remedios loquitos',
    fecha: '2025-05-11T19:48:46+00:00'
  },
  {
    filename: 'kevin-omelette.jpeg',
    descripcion: 'soy severendo crack, una foto digna de revista',
    fecha: '2025-05-18T09:22:24+00:00'
  },
  {
    filename: 'kevin-errorverde.jpeg',
    descripcion: 'axilio socorro, no se hacer empanadas de verde',
    fecha: '2025-05-18T18:32:28+00:00'
  },
  {
    filename: 'saul-toppirata.jpeg',
    descripcion: 'No salimos pero momento memorable jsjs',
    fecha: '2025-05-28T23:55:20+00:00'
  },
  {
    filename: 'ballerina-001.jpeg',
    descripcion: 'baby ballerina, estaba chiquitititita',
    fecha: '2025-05-30T18:36:17+00:00'
  },
  {
    filename: 'ballerina-002.jpeg',
    descripcion: 'ballerina otra vez, con razon que es engreida',
    fecha: '2025-05-31T08:51:17+00:00'
  },
  {
    filename: 'ale-todosederrumbo.jpeg',
    descripcion: 'pobre ale :c todo comenzo a salir mal desde ese suceso ... paro',
    fecha: '2025-06-01T16:09:09+00:00'
  },
  {
    filename: 'ale-morocho.jpeg',
    descripcion: 'Ale y un morocho, un morocho y Ale :3',
    fecha: '2025-06-06T18:56:10+00:00'
  },
  {
    filename: 'kevin-dormilon.jpeg',
    descripcion: 'de chill',
    fecha: '2025-06-14T09:47:57+00:00'
  },
  {
    filename: 'ale-lindacomosiempre.jpeg',
    descripcion: 'Ale y su crustaceo favorito, estas bella mi amor jeje',
    fecha: '2025-06-15T12:28:37+00:00'
  },
  {
    filename: 'ale-pilates001.jpeg',
    descripcion: 'en su era pilates lalala',
    fecha: '2025-06-18T18:56:42+00:00'
  },
  {
    filename: 'ale-error002.jpeg',
    descripcion: 'Adivinen quien se trajo las llaves del carro de steven jajajaja',
    fecha: '2025-06-19T18:36:45+00:00'
  },
  {
    filename: 'kevin-diplomagrad.jpeg',
    descripcion: 'Graduadeichon',
    fecha: '2025-06-20T10:58:03+00:00'
  },
  {
    filename: 'ale-rimelmal.jpeg',
    descripcion: 'Confió en un TikTok y el rimel se le corrio?',
    fecha: '2025-06-21T22:24:20+00:00'
  },
  {
    filename: 'ale-pilates002.jpeg',
    descripcion: 'miau, grr, woof woof',
    fecha: '2025-06-26T18:54:33+00:00'
  },
  {
    filename: 'aleyo-paginaweb.jpeg',
    descripcion: 'el origen de todo jajaja',
    fecha: '2025-06-29T09:46:53+00:00'
  },
  {
    filename: 'kevin-mediasfavoritas.jpeg',
    descripcion: 'Das buenos regalos amor todo lo uso, te amo',
    fecha: '2025-06-29T22:07:34+00:00'
  },
  {
    filename: 'aleyo-fotobonita.jpeg',
    descripcion: 'Dos guapos, de las primeras veces que te abrazaba por detras con segundas intenciones jeje',
    fecha: '2025-06-30T00:02:04+00:00'
  },
  {
    filename: 'kevin-tazagatita.jpeg',
    descripcion: '😭😭 mi tacita de gato :( lo siento bebe',
    fecha: '2025-06-30T07:39:11+00:00'
  },
  {
    filename: 'ale-ojoslocos.jpeg',
    descripcion: 'Alesita en pijama',
    fecha: '2025-07-02T23:50:46+00:00'
  },
  {
    filename: 'kevin-shootmortal.jpeg',
    descripcion: 'Vodka ají matador juias juas',
    fecha: '2025-07-05T14:03:31+00:00'
  },
  {
    filename: 'kevin-victimashootmortal.jpeg',
    descripcion: 'victima del vodka ají matador',
    fecha: '2025-07-05T14:03:01+00:00'
  },
  {
    filename: 'ale-diomio.jpeg',
    descripcion: '😍😍😍 pero que ven mis ojos diomio',
    fecha: '2025-07-05T16:29:56+00:00'
  },
  {
    filename: 'ale-ysusamigas.jpeg',
    descripcion: 'las crumbl cucas o algo por el estilo (me contuve jsjs)',
    fecha: '2025-07-05T21:22:15+00:00'
  },
  {
    filename: 'ale-fetichista02.jpeg',
    descripcion: 'jajaja con esas locuras me enamoraste sapa',
    fecha: '2025-07-05T22:24:53+00:00'
  },
  {
    filename: 'kevin-desayunito.jpeg',
    descripcion: '😭😭 mi tacita',
    fecha: '2025-07-09T07:32:50+00:00'
  },
  {
    filename: 'ale-cenafit.jpeg',
    descripcion: 'Comidita fitness',
    fecha: '2025-07-10T19:08:29+00:00'
  },
  {
    filename: 'kevin-evidenciaA.jpeg',
    descripcion: 'Evidencia, pacifico me devolvió la compra de los smart rolls jeje',
    fecha: '2025-07-11T07:14:28+00:00'
  },
  {
    filename: 'copo-quehorror.jpeg',
    descripcion: 'Pobre copito jsjs',
    fecha: '2025-06-17T22:28:33+00:00'
  },
  {
    filename: 'kevin-tumblr.jpeg',
    descripcion: 'si es borrosa es tumblr',
    fecha: '2025-06-28T08:59:09+00:00'
  },
  {
    filename: 'ale-azulgod.jpeg',
    descripcion: 'Parece una muñequita O;',
    fecha: '2025-07-13T11:33:23+00:00'
  },
  {
    filename: 'pierina-chao.jpeg',
    descripcion: 'pipipipi',
    fecha: '2025-07-18T23:42:21+00:00'
  },
  {
    filename: 'kevin-ojito.jpeg',
    descripcion: 'ojito mi amor',
    fecha: '2025-07-26T18:56:23+00:00'
  },
  {
    filename: 'kevin-fotoperfil.jpeg',
    descripcion: 'oye si quedaba de foto de perfil sabes jaja',
    fecha: '2025-07-26T20:35:57+00:00'
  },
  {
    filename: 'ale-rulay.jpeg',
    descripcion: 'andamo rulay andamo rulaay',
    fecha: '2025-07-27T18:26:09+00:00'
  },
  {
    filename: 'ballerina-castrada.jpeg',
    descripcion: 'Ligada de ballerina jajaj',
    fecha: '2025-08-02T17:41:48+00:00'
  },
  {
    filename: 'father-son.jpeg',
    descripcion: 'Like father like son',
    fecha: '2025-08-08T19:56:58+00:00'
  },
  {
    filename: 'gatita01.jpeg',
    descripcion: 'Pero que linda gatita O;',
    fecha: '2025-08-09T16:23:33+00:00'
  },
  {
    filename: 'pelucheraro.jpeg',
    descripcion: 'Se ve super real wtf',
    fecha: '2025-08-11T22:06:10+00:00'
  },
  {
    filename: 'kevin-grillo.jpeg',
    descripcion: 'un pejelagarto',
    fecha: '2025-08-11T22:10:50+00:00'
  },
  {
    filename: 'ale-fantasma.jpeg',
    descripcion: 'si fueras un fantasma yo si me vuelvo a enamorar de ti',
    fecha: '2025-08-12T22:43:25+00:00'
  },
  {
    filename: 'kevin-buennovio.jpeg',
    descripcion: 'Como todo buen novio te saqué un ticket de comida',
    fecha: '2025-08-13T13:36:17+00:00'
  },
  {
    filename: 'kevin-malditabrea.jpeg',
    descripcion: 'Pinche brea, me daño un buen pantalón 😭😭',
    fecha: '2025-08-13T15:26:03+00:00'
  },
  {
    filename: 'ale-emiliaconcert.jpeg',
    descripcion: 'Concierto de emilia wuuuuu',
    fecha: '2025-08-15T20:17:10+00:00'
  },
  {
    filename: 'aleyo-tacitasfoto.jpeg',
    descripcion: 'Una pareja muy feliz claroqiesí',
    fecha: '2025-08-16T17:23:53+00:00'
  },
  {
    filename: 'kevin-arrormalote.jpeg',
    descripcion: 'Error garrafal jajaja',
    fecha: '2025-08-22T12:53:33+00:00'
  },
  {
    filename: 'aleyo-gym001.jpeg',
    descripcion: 'sudados pero no por las razones correctas 😒',
    fecha: '2025-08-23T20:12:04+00:00'
  },
  {
    filename: 'aleyo-gym002.jpeg',
    descripcion: 'er diavlo mano y ese brazo?',
    fecha: '2025-08-24T01:39:56+00:00'
  },
  {
    filename: 'copito-wapo02.jpeg',
    descripcion: 'Lo subo nada mas porque está wapo',
    fecha: '2025-08-24T04:12:36+00:00'
  },
  {
    filename: 'ballerina-003.jpeg',
    descripcion: 'Y esa gata piciosa toda ninja',
    fecha: '2025-08-26T20:36:06+00:00'
  },
  {
    filename: 'quejeso.jpeg',
    descripcion: 'quejeso de nuevo jsjsj',
    fecha: '2025-08-29T21:45:35+00:00'
  },
  {
    filename: 'quejeso02.jpeg',
    descripcion: 'jsjsjs que miedo',
    fecha: '2025-08-30T07:47:23+00:00'
  },
  {
    filename: 'kevin-squites.jpeg',
    descripcion: 'que rikos esquites diomio',
    fecha: '2025-08-30T13:51:10+00:00'
  },
  {
    filename: 'kevin-comida.jpeg',
    descripcion: 'que rico diomio',
    fecha: '2025-09-02T18:58:02+00:00'
  }
]

const parseDateCandidate = (value) => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const pickOldestDate = (dates) => {
	const validDates = dates.filter(Boolean);
	if (!validDates.length) return null;
	return validDates.reduce((min, current) => (current < min ? current : min), validDates[0]);
};

const loadPhotoDates = async () => {
	try {
		const url = new URL('./photoDates.json', import.meta.url);
		const response = await fetch(url);
		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		console.error('Error al leer photoDates.json:', error);
		return [];
	}
};

export const loadCardRegistros = async () => {
	Card.resetCounter(0);
	const photoDates = await loadPhotoDates();
	const dateMap = new Map(
		photoDates.map((item) => [
			item.filename,
			{
				creacion: parseDateCandidate(item.fechaCreacion),
				modificacion: parseDateCandidate(item.fechaUltimaModificacion)
			}
		])
	);

	return photoData.map((item) => {
		const dates = dateMap.get(item.filename);
		const fecha = dates ? pickOldestDate([dates.creacion, dates.modificacion]) : null;
		return new Card({
			filename: item.filename,
			descripcion: item.descripcion,
			fecha
		});
	});
};

export const getPhotoData = () => [...photoData];
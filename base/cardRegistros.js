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
    descripcion: 'Alejandra saliendo de algún sitio quien sabe donde pero está linda ñam te como toda',     
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
    descripcion: 'AirBnb para pasar el rato guiño* guiño* 🫦🔥, anyways mascarilla humectante y baño bonito  👌',
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
    descripcion: 'Sushi en noe sushi luego de una sesion de ejercicio dura (no fue lo único que se endureció), unos besos apasionados y full sudor. Un buen merecido sushi, hubo un show con fuego y saque para unos rollos 8/10 debía ser de noche para apreciarse mejor pipipi',
    fecha: '2025-08-24T15:10:12.999297+00:00'
  },
  {
    filename: 'yo-cerofetiche.jpg',
    descripcion: 'Foto para mi novia que solo me busca por mi esculpido cuerpo, calor natural a hombre y confort de confianza ... censura en las axilas xq alejandrita tiene fetiches :p',
    fecha: '2025-11-15T19:55:06.710219+00:00'
  },
  {
    filename: 'yo-corteintento1000.jpg',
    descripcion: 'El propietario de este Blog/PaginaWeb/PortalDeMeseversario/ElAmorDeTuVida en su intento numero 10x10^10000 de cortarse el pelo solo',
    fecha: '2025-08-31T18:08:27.456809+00:00'
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
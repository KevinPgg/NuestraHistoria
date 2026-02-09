// 1. Convertimos photoDates en un objeto de búsqueda rápida (Mapa)
// Asumimos que photoDates es el array que enviaste
const photoDates = [
  {
    "filename": "ale-alealesita.jpg",
    "fechaCreacion": "2025-11-30T21:30:45.043264+00:00",
    "fechaUltimaModificacion": "2025-09-28T19:54:04.443007+00:00"
  },
  {
    "filename": "ale-barba.jpg",
    "fechaCreacion": "2025-11-30T21:27:39.033658+00:00",
    "fechaUltimaModificacion": "2025-11-03T08:18:50.746923+00:00"
  },
  {
    "filename": "ale-cumple-giftsetup.jpg",
    "fechaCreacion": "2025-11-30T21:27:32.198712+00:00",
    "fechaUltimaModificacion": "2025-11-04T10:21:00.330673+00:00"
  },
  {
    "filename": "ale-darkera.jpg",
    "fechaCreacion": "2025-11-30T21:30:20.492663+00:00",
    "fechaUltimaModificacion": "2025-10-06T21:40:38.222183+00:00"
  },
  {
    "filename": "ale-erahumilde.jpg",
    "fechaCreacion": "2025-11-30T21:26:49.318608+00:00",
    "fechaUltimaModificacion": "2025-11-09T23:26:15.809031+00:00"
  },
  {
    "filename": "ale-eresrara.jpg",
    "fechaCreacion": "2025-11-30T21:26:05.545624+00:00",
    "fechaUltimaModificacion": "2025-11-23T23:16:10.725909+00:00"
  },
  {
    "filename": "ale-floresamarillas.jpg",
    "fechaCreacion": "2025-11-30T21:31:03.948638+00:00",
    "fechaUltimaModificacion": "2025-09-21T16:14:02.250971+00:00"
  },
  {
    "filename": "ale-leona.jpg",
    "fechaCreacion": "2025-11-30T21:25:57.423418+00:00",
    "fechaUltimaModificacion": "2025-11-25T22:47:22.471636+00:00"
  },
  {
    "filename": "ale-policia.jpg",
    "fechaCreacion": "2025-11-30T21:27:46.071175+00:00",
    "fechaUltimaModificacion": "2025-11-02T13:57:24.659773+00:00"
  },
  {
    "filename": "ale-vascalove.jpg",
    "fechaCreacion": "2025-11-30T21:27:13.064787+00:00",
    "fechaUltimaModificacion": "2025-11-04T10:18:52.639510+00:00"
  },
  {
    "filename": "ale-waparubia.jpg",
    "fechaCreacion": "2025-11-30T21:26:26.768743+00:00",
    "fechaUltimaModificacion": "2025-11-16T21:22:33.404191+00:00"
  },
  {
    "filename": "ale.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.313485+00:00",
    "fechaUltimaModificacion": "2025-05-02T13:36:14.778910+00:00"
  },
  {
    "filename": "alemichi.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.342493+00:00",
    "fechaUltimaModificacion": "2025-06-29T08:44:22.961998+00:00"
  },
  {
    "filename": "alerojo.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.346258+00:00",
    "fechaUltimaModificacion": "2025-06-02T00:11:46.573258+00:00"
  },
  {
    "filename": "aleyo-beforedanny.jpg",
    "fechaCreacion": "2025-11-30T21:31:13.065414+00:00",
    "fechaUltimaModificacion": "2025-09-14T13:04:26.011091+00:00"
  },
  {
    "filename": "aleyo-caras.jpg",
    "fechaCreacion": "2025-11-30T21:29:08.629996+00:00",
    "fechaUltimaModificacion": "2025-10-19T18:48:36.095357+00:00"
  },
  {
    "filename": "aleyo-casares.png",
    "fechaCreacion": "2025-11-30T21:19:25.402598+00:00",
    "fechaUltimaModificacion": "2025-11-30T21:18:05.274243+00:00"
  },
  {
    "filename": "aleyo-cochinos.jpg",
    "fechaCreacion": "2025-11-30T21:28:37.079916+00:00",
    "fechaUltimaModificacion": "2025-10-19T18:48:54.873399+00:00"
  },
  {
    "filename": "aleyo-cochinos2.jpg",
    "fechaCreacion": "2025-11-30T21:28:45.143151+00:00",
    "fechaUltimaModificacion": "2025-10-19T18:48:52.354490+00:00"
  },
  {
    "filename": "aleyo-cumpleale-loquitos1.jpg",
    "fechaCreacion": "2025-11-30T21:29:52.253346+00:00",
    "fechaUltimaModificacion": "2025-10-06T21:40:49.541114+00:00"
  },
  {
    "filename": "aleyo-cumpleale-loquitos2.jpg",
    "fechaCreacion": "2025-11-30T21:30:13.013395+00:00",
    "fechaUltimaModificacion": "2025-10-06T21:40:47.314975+00:00"
  },
  {
    "filename": "aleyo-dannyocean.jpg",
    "fechaCreacion": "2025-11-30T21:31:23.007440+00:00",
    "fechaUltimaModificacion": "2025-09-14T13:04:25.606184+00:00"
  },
  {
    "filename": "aleyo-gorra.jpg",
    "fechaCreacion": "2025-11-30T21:28:06.348290+00:00",
    "fechaUltimaModificacion": "2025-10-26T13:55:15.272466+00:00"
  },
  {
    "filename": "aleyo-gym.jpg",
    "fechaCreacion": "2025-11-30T21:32:31.834243+00:00",
    "fechaUltimaModificacion": "2025-11-30T21:33:44.129019+00:00"
  },
  {
    "filename": "aleyo-happymoment1.jpg",
    "fechaCreacion": "2025-11-30T21:27:01.006591+00:00",
    "fechaUltimaModificacion": "2025-11-05T20:43:34.800227+00:00"
  },
  {
    "filename": "aleyo-jejeje-mascarilla.jpg",
    "fechaCreacion": "2025-11-30T21:29:39.890855+00:00",
    "fechaUltimaModificacion": "2025-10-11T13:27:20.291860+00:00"
  },
  {
    "filename": "aleyo-jejeje.jpg",
    "fechaCreacion": "2025-11-30T21:29:28.343354+00:00",
    "fechaUltimaModificacion": "2025-10-11T13:27:20.458944+00:00"
  },
  {
    "filename": "aleyo-patos.jpg",
    "fechaCreacion": "2025-11-30T21:28:56.657162+00:00",
    "fechaUltimaModificacion": "2025-10-19T18:48:50.059004+00:00"
  },
  {
    "filename": "aleyo-placidez.jpg",
    "fechaCreacion": "2025-11-30T21:28:17.670547+00:00",
    "fechaUltimaModificacion": "2025-10-19T21:12:00.354680+00:00"
  },
  {
    "filename": "aleyo-placidez2.jpg",
    "fechaCreacion": "2025-11-30T21:28:26.600180+00:00",
    "fechaUltimaModificacion": "2025-10-19T21:07:43.767285+00:00"
  },
  {
    "filename": "aleyo-portones.jpg",
    "fechaCreacion": "2025-11-30T21:30:34.650391+00:00",
    "fechaUltimaModificacion": "2025-07-12T13:16:14.239408+00:00"
  },
  {
    "filename": "aleyo-promise.jpg",
    "fechaCreacion": "2025-11-30T21:31:41.903980+00:00",
    "fechaUltimaModificacion": "2025-09-14T13:04:23.498439+00:00"
  },
  {
    "filename": "aleyo-skincare.jpg",
    "fechaCreacion": "2025-11-30T21:31:31.366547+00:00",
    "fechaUltimaModificacion": "2025-09-14T13:04:25.218262+00:00"
  },
  {
    "filename": "aleyo.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.357371+00:00",
    "fechaUltimaModificacion": "2025-06-29T08:43:52.282095+00:00"
  },
  {
    "filename": "aleyopanora.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.362962+00:00",
    "fechaUltimaModificacion": "2025-06-07T23:06:26.861937+00:00"
  },
  {
    "filename": "aleyotop.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.379534+00:00",
    "fechaUltimaModificacion": "2025-06-29T08:42:56.308116+00:00"
  },
  {
    "filename": "alyo-casares-6m-muack.jpg",
    "fechaCreacion": "2025-11-30T21:25:48.874204+00:00",
    "fechaUltimaModificacion": "2025-11-30T21:11:28.283137+00:00"
  },
  {
    "filename": "alyo-casares-6m.jpg",
    "fechaCreacion": "2025-11-30T21:25:33.955778+00:00",
    "fechaUltimaModificacion": "2025-11-30T21:11:30.069388+00:00"
  },
  {
    "filename": "canela.jpg",
    "fechaCreacion": "2025-06-29T08:42:27.906975+00:00",
    "fechaUltimaModificacion": "2025-06-21T21:45:47.329646+00:00"
  },
  {
    "filename": "merhaba.jpg",
    "fechaCreacion": "2025-11-30T21:32:01.171059+00:00",
    "fechaUltimaModificacion": "2025-08-29T22:21:09.447625+00:00"
  },
  {
    "filename": "payaso.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.457558+00:00",
    "fechaUltimaModificacion": "2025-06-29T08:36:59.370209+00:00"
  },
  {
    "filename": "provolatta.jpg",
    "fechaCreacion": "2025-11-30T21:25:21.119360+00:00",
    "fechaUltimaModificacion": "2025-11-30T21:11:31.477113+00:00"
  },
  {
    "filename": "suchi.jpg",
    "fechaCreacion": "2025-11-30T21:32:12.241610+00:00",
    "fechaUltimaModificacion": "2025-08-24T15:10:12.999297+00:00"
  },
  {
    "filename": "yo-cerofetiche.jpg",
    "fechaCreacion": "2025-11-30T21:26:37.520057+00:00",
    "fechaUltimaModificacion": "2025-11-15T19:55:06.710219+00:00"
  },
  {
    "filename": "yo-corteintento1000.jpg",
    "fechaCreacion": "2025-11-30T21:31:54.590754+00:00",
    "fechaUltimaModificacion": "2025-08-31T18:08:27.456809+00:00"
  },
  {
    "filename": "yo-hailhitler.jpg",
    "fechaCreacion": "2025-11-30T21:30:53.980810+00:00",
    "fechaUltimaModificacion": "2025-09-21T00:22:50.479224+00:00"
  },
  {
    "filename": "yo-paratisapa.jpg",
    "fechaCreacion": "2025-11-30T21:26:18.963447+00:00",
    "fechaUltimaModificacion": "2025-11-23T23:16:04.300628+00:00"
  },
  {
    "filename": "yo-paratisapa2.jpg",
    "fechaCreacion": "2025-11-30T21:29:19.314466+00:00",
    "fechaUltimaModificacion": "2025-10-14T23:17:58.232725+00:00"
  },
  {
    "filename": "yo-pumplips.jpg",
    "fechaCreacion": "2025-11-30T21:27:55.163730+00:00",
    "fechaUltimaModificacion": "2025-10-26T13:55:21.698681+00:00"
  },
  {
    "filename": "yo.jpg",
    "fechaCreacion": "2025-06-29T08:08:31.469040+00:00",
    "fechaUltimaModificacion": "2025-05-11T19:00:47.340279+00:00"
  }
]

const photoData = [
	{
		filename: 'ale.jpg',
		descripcion: 'Alejandra preciosa con un pump lipstick delicioso ... digo lindo, hermoso, precioso, mi amor, mi novia, mi todo, mi vida, mi corazón jeje sapa'
	},
	{
		filename: 'aleyo.jpg',
		descripcion: 'Foto en el espejo del mall del sol, comida y primer regalo O:'
	},
	{
		filename: 'aleyopanora.jpg',
		descripcion: 'Alejandra y Kevin en panoramix, momento de lanzar vejigas con pintura y romper cosas muajaja'
	},
	{
		filename: 'aleyotop.jpg',
		descripcion: 'Foto en el otro espejo del mall del sol jajaja kevin salió wapote'
	},
	{
		filename: 'canela.jpg',
		descripcion: 'Comidita en SportGarden y los pan de canela en SecretRoll ulala, bacon-honey, nutella, tradicional y nutella'
	},
	{
		filename: 'payaso.jpg',
		descripcion: 'Foto desprevenida cuando comimos pizza con los chicos y alex jsjjs'
	},
	{
		filename: 'yo.jpg',
		descripcion: 'Foto mia de kevin en un restaurant de ramen haciendo una pose kawai >.< nya!'
	},
	{
		filename: 'ale-alealesita.jpg',
		descripcion: 'Ale alesita foto de perfil linda, muaks 💋💋'
	},
	{
		filename: 'ale-barba.jpg',
		descripcion: 'Alejandra practicando para su rol de bagabundo/homeless, si le sale el papel #homeless#zuricataslavanos🙏'
	},
	{
		filename: 'ale-cumple-giftsetup.jpg',
		descripcion: 'el setup del regalo de cumpleaños que me dió mi novia preciosa 😭'
	},
	{
		filename: 'ale-darkera.jpg',
		descripcion: 'Alejandra en su etapa emo, se escapaba de casa 1 vez cada dos semanas porque no apayaban su sueño de ser youtuber y su canal de imichi no ganaba vistas 😞'
	},
	{
		filename: 'ale-erahumilde.jpg',
		descripcion: 'Momento humilda de mi novia preciosa cuando se expuso a llorar en vivo por un trend jajajjaja te amo mi amorcitop ❤️'
	},
	{
		filename: 'ale-eresrara.jpg',
		descripcion: 'Foto atesorada de mi corazon ... tiene gustos raros pero que se puede hacer la amo'
	},
	{
		filename: 'aleyo-beforedanny.jpg',
		descripcion: 'Foto obligada porque alejandra estaba molesta conmigo por llegar tarde jiji 😅, se nota como yo(kevin) parece tener labial y alejandra no ... pura coincidencia 👀, la cama desordenada también es coincidencia'
	},
	{
		filename: 'ale-floresamarillas.jpg',
		descripcion: 'Girasoles amarillos (tus favoritos mi amor 💛) para el 21 de septiembre, y con tus flores amarillaaaaaas'
	},
	{
		filename: 'ale-leona.jpg',
		descripcion: 'Grr amorcito estas cansadita pero igual estas preciosa, pareces una leonsita jajja te amo sapa'
	},
	{
		filename: 'ale-policia.jpg',
		descripcion: '😳😳😳😳😳 de ti si me dejo esposar'
	},
	{
		filename: 'ale-waparubia.jpg',
		descripcion: 'Alejandra saliendo de algún sitio quien sabe donde pero está linda ñam te como toda'
	},
	{
		filename: 'aleyo-caras.jpg',
		descripcion: 'Pareja de locos hacinedo caras locas, a la izquierda vemos a alejandra viviendo su mejor vida jajaj <3'
	},
	{
		filename: 'aleyo-casares.png',
		descripcion: 'Fotito comeindo en casares, Felices 6 Meses!!! Muacks mi amor ❤️ somos unos crack para las relaciones 😎'
	},
	{
		filename: 'aleyo-cochinos2.jpg',
		descripcion: 'Emmmm .... nada que ver sigue scrolleando 😳'
	},
	{
		filename: 'aleyo-cochinos.jpg',
		descripcion: 'Esta es mas suave jeje un besito tierno'
	},
	{
		filename: 'aleyo-cumpleale-loquitos1.jpg',
		descripcion: 'Cumpleaños de alejandrita 22años Foto en honor a la sonrisa de la prima de ale jajjajaj, mi amor estas gapisima O;'
	},
	{
		filename: 'aleyo-cumpleale-loquitos2.jpg',
		descripcion: 'Cumpleaños de alejandrita 22años en la cocina jejeje only tenderness'
	},
	{
		filename: 'aleyo-dannyocean.jpg',
		descripcion: 'Concierto daniel oceano, estaba chevere. Alejandra la pasó increible jsjs se quedó muda mi amor gritando por otro hombre en frente de mi 😠😠 una grosera'
	},
	{
		filename: 'aleyo-gorra.jpg',
		descripcion: 'After gym, gorra evita-verguenzas. Me rapé por "accidente" 👀👀'
	},
	{
		filename: 'aleyo-gym.jpg',
		descripcion: 'Foto en el gym, primera vez en el gym, mmmmm no es la mejor foto jsjs'
	},
	{
		filename: 'aleyo-happymoment1.jpg',
		descripcion: 'Cita en Tania`s Café, hicimos tacitas y nos nos tomamos fotos. Aquí alejandra se enamoró más de mí 😳😳😳😳😳'
	},
	{
		filename: 'aleyo-jejeje-mascarilla.jpg',
		descripcion: 'AirBnb para pasar el rato guiño* guiño* 🫦🔥, anyways mascarilla humectante y baño bonito 👌'
	},
	{
		filename: 'aleyo-jejeje.jpg',
		descripcion: 'jejeje en un lugar jejeje airbnb baño, outfit pelao sambo short hasta encima de la rodilla'
	},
	{
		filename: 'aleyo-patos.jpg',
		descripcion: 'Mi amorcito y yo haciendo como patos en uno de las pijamadas jeje'
	},
	{
		filename: 'aleyo-placidez.jpg',
		descripcion: 'Fotito top, salí con una sonrisota, alejandra esta lindota 😭 y los recuerdos de las estrellitas anti acné'
	},
	{
		filename: 'aleyo-placidez2.jpg',
		descripcion: 'Foto de felicidad, alejandra no supo hasta los 6 meses que tenía una cicatriz en el labio jsjs'
	},
	{
		filename: 'aleyo-portones.jpg',
		descripcion: 'Yo (Kevin) y una fan tomandose una foto sin mi consentimiento ni aprobación, una clara violación a mis derechos constitucionales e integridad como humano pero como estaba linda y tierna la dejé'
	},
	{
		filename: 'aleyo-promise.jpg',
		descripcion: 'Primera foto que subo a estados *whatsapp* demostrando mi relación y promesa con quien sería mi linda noviecilla actual aka. sapa'
	},
	{
		filename: 'aleyo-skincare.jpg',
		descripcion: 'Primer skincare luego del concierto del daniel oceano, no tenemos foto pero nos comimos un choclo asado al salir del concierto, yo me pedi mollejas jejeje'
	},
	{
		filename: 'alyo-casares-6m-muack.jpg',
		descripcion: 'Casa res foto de beso, corte de maliante oyite bb brrrr'
	},
	{
		filename: 'alyo-casares-6m.jpg',
		descripcion: 'Casa res fotoito, alejandra salió wapisima wtf O: 😍😍 yo sali con mi ojo vago jsjsj'
	},
	{
		filename: 'merhaba.jpg',
		descripcion: 'El icónico merhaba, que no hago yo por hacer feliz a mi mujer, mi niña, mi princesa, al amor de mi vida. En fin me quise parecer a los turcos merhaba signfica familia digo hola'
	},
	{
		filename: 'provolatta.jpg',
		descripcion: 'No estamos ninguno de los wapos (mi amorcito y yo) pero ese queso provolone y burrata estaba bestial, con pan de ajo quedó muy yuuuuuumi yum like yumi yum.'
	},
	{
		filename: 'suchi.jpg',
		descripcion: 'Sushi en noe sushi luego de una sesion de ejercicio dura (no fue lo único que se endureció), unos besos apasionados y full sudor. Un buen merecido sushi, hubo un show con fuego y saque para unos rollos 8/10 debía ser de noche para apreciarse mejor pipipi'
	},
	{
		filename: 'yo-cerofetiche.jpg',
		descripcion: 'Foto para mi novia que solo me busca por mi esculpido cuerpo, calor natural a hombre y confort de confianza ... censura en las axilas xq alejandrita tiene fetiches :p'
	},
	{
		filename: 'yo-corteintento1000.jpg',
		descripcion: 'El propietario de este Blog/PaginaWeb/PortalDeMeseversario/ElAmorDeTuVida en su intento numero 10x10^10000 de cortarse el pelo solo'
	},
	{
		filename: 'yo-hailhitler.jpg',
		descripcion: 'Foto imitando a los seguidores y al que no debe ser nombrado. ------------------------------------------------------------------------Pista: jabón-----------------------------------------------------'
	},
	{
		filename: 'yo-paratisapa2.jpg',
		descripcion: 'No sé en que estaba pensando cuando incluí esa foto aquí pero bueno mostrando la barbita 😳'
	},
	{
		filename: 'yo-paratisapa.jpg',
		descripcion: 'Foto de varias fotos las cuales le regalé a mi novia porque ese día estaba especialmente linda, el michi es un filtro jsjsjs está cool'
	},
	{
		filename: 'yo-pumplips.jpg',
		descripcion: 'Estoy yo luego de samparme varias cucharadas de ají (oil chilli flakes) producto estrella de mis ajíes pero si que me inchó los labio diomio.'
	}
];


const dateMap = {};
photoDates.forEach(item => {
    dateMap[item.filename] = item.fechaUltimaModificacion;
});

// 2. Llenamos el campo 'fecha' en photoData
const finalPhotoData = photoData.map(photo => {
    return {
        ...photo,
        // Buscamos la fecha en nuestro mapa usando el filename
        fecha: dateMap[photo.filename] || null 
    };
});

console.log(finalPhotoData);
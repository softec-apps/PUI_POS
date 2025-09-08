import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const terms = {
	lastUpdated: '1 de Enero de 2024',
	sections: {
		introduction: {
			title: 'Introducción',
			content:
				'Estos Términos y Condiciones ("Términos") regulan el uso del sistema de punto de venta (POS) proporcionado por [Nombre de la Empresa] ("Proveedor", "nosotros", "nuestro"). Al acceder, registrar una cuenta o utilizar esta plataforma, usted ("Usuario", "usted") acepta cumplir con estos Términos en su totalidad. Si no está de acuerdo con alguna parte de estos Términos, no podrá utilizar nuestros servicios.',
		},
		definitions: {
			title: 'Definiciones',
			content:
				'Para los efectos de estos Términos, se entenderá por: (a) "Sistema POS": la plataforma de software proporcionada por el Proveedor que incluye todas sus funcionalidades, módulos, actualizaciones y documentación asociada; (b) "Usuario": la persona natural o jurídica que utiliza el Sistema POS; (c) "Contenido": toda información, datos, textos, software, sonidos, fotografías, gráficos, vídeos u otros materiales que el Usuario introduzca en el Sistema POS; (d) "Servicios": todas las funcionalidades, características y servicios proporcionados a través del Sistema POS.',
		},
		accountRegistration: {
			title: 'Registro de Cuenta',
			content:
				'Para utilizar el Sistema POS, deberá registrarse proporcionando información completa y precisa. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Notifíquenos inmediatamente cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad. Nos reservamos el derecho de rechazar el registro o cancelar cuentas a nuestra entera discreción.',
		},
		license: {
			title: 'Licencia de Uso',
			content:
				'Sujeto al cumplimiento de estos Términos, le otorgamos una licencia limitada, no exclusiva, intransferible y revocable para utilizar el Sistema POS únicamente para fines comerciales legítimos. Esta licencia no constituye una venta del software ni de sus componentes. Quedan expresamente prohibidas la ingeniería inversa, descompilación, modificación o creación de obras derivadas basadas en el Sistema POS.',
		},
		usage: {
			title: 'Uso Aceptable del Sistema',
			content:
				'El Sistema POS está diseñado exclusivamente para facilitar la gestión de ventas, inventario, facturación y procesos administrativos. Queda estrictamente prohibido utilizarlo para: (a) actividades fraudulentas, ilegales o que infrinjan derechos de terceros; (b) alojar o transmitir virus, malware o cualquier código destructivo; (c) vulnerar la seguridad o integridad de cualquier red, sistema o servicio; (d) enviar comunicaciones no solicitadas o masivas ("spam"); (e) suplantar la identidad de cualquier persona o entidad.',
		},
		userResponsibilities: {
			title: 'Responsabilidades del Usuario',
			content:
				'Usted es responsable de: (a) la exactitud, veracidad y legalidad de toda la información ingresada (ventas, inventario, datos de clientes y facturación); (b) garantizar que sus empleados o colaboradores utilicen el sistema de manera correcta y conforme a la ley; (c) cumplir con todas las leyes y regulaciones aplicables a su negocio, incluyendo pero no limitado a legislación tributaria, protección de datos y derechos del consumidor; (d) mantener copias de seguridad de sus datos críticos; (e) notificar inmediatamente cualquier vulnerabilidad de seguridad descubierta.',
		},
		privacy: {
			title: 'Privacidad y Protección de Datos',
			content:
				'La recopilación y tratamiento de datos personales se realiza conforme a nuestra Política de Privacidad y las normativas aplicables de protección de datos. Como responsable del tratamiento de los datos de sus clientes, usted garantiza haber informado adecuadamente a los titulares de los datos sobre su incorporación en el Sistema POS y haber obtenido los consentimientos necesarios cuando corresponda. Implementamos medidas de seguridad técnicas y organizativas apropiadas, pero no podemos garantizar la seguridad absoluta de la información transmitida o almacenada.',
		},
		intellectualProperty: {
			title: 'Propiedad Intelectual',
			content:
				'Todos los derechos de propiedad intelectual sobre el Sistema POS, incluyendo pero no limitado a software, diseños, gráficos, textos, logotipos y documentación, son propiedad exclusiva del Proveedor o de sus licenciantes. Usted retiene todos los derechos sobre los datos que introduzca en el sistema, pero nos otorga una licencia para utilizar dichos datos únicamente para prestar los servicios. No adquirirá ningún derecho sobre nuestra propiedad intelectual excepto la licencia limitada expresamente concedida en estos Términos.',
		},
		billing: {
			title: 'Facturación y Pagos',
			content:
				'En caso de integraciones con sistemas de facturación electrónica, usted deberá garantizar que los datos proporcionados sean correctos y cumplir con toda la normativa aplicable. Los planes de suscripción o licenciamiento del POS deberán pagarse puntualmente conforme a las condiciones pactadas. Los precios podrán ser modificados con un preaviso de 30 días. El no pago podrá resultar en la suspensión o terminación del servicio. Todos los impuestos aplicables correrán por su cuenta.',
		},
		thirdPartyServices: {
			title: 'Servicios de Terceros',
			content:
				'El Sistema POS puede integrar o enlazar a servicios de terceros. Estos servicios se rigen por sus propios términos y condiciones. No tenemos control sobre estos servicios y no somos responsables de su contenido, funcionalidad, precisión, legalidad o disponibilidad. La inclusión de cualquier enlace o integración no implica nuestra aprobación o respaldo.',
		},
		security: {
			title: 'Seguridad del Sistema',
			content:
				'El Sistema POS incorpora medidas de seguridad para proteger la información. Sin embargo, usted debe utilizar dispositivos seguros, redes confiables y mantener actualizados sus sistemas. No seremos responsables por accesos indebidos derivados de negligencia en la custodia de contraseñas, dispositivos o por vulnerabilidades en sistemas bajo su control. Usted acepta notificarnos inmediatamente cualquier violación de seguridad de la que tenga conocimiento.',
		},
		availability: {
			title: 'Disponibilidad del Servicio',
			content:
				'Nos esforzamos por mantener el Sistema POS disponible sin interrupciones, pero no garantizamos su disponibilidad ininterrumpida o libre de errores. Podremos realizar mantenimiento programado con preaviso razonable. No seremos responsables por interrupciones debidas a causas fuera de nuestro control razonable (fuerza mayor).',
		},
		liability: {
			title: 'Limitación de Responsabilidad',
			content:
				'En la máxima medida permitida por la ley, nuestro liability total hacia usted por cualquier reclamación bajo estos Términos no excederá el monto total pagado por usted durante los seis meses anteriores al evento que dio lugar a la reclamación. No seremos responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pero no limitado a pérdida de beneficios, ingresos, datos o uso. Nada en estos Términos excluye o limita nuestra responsabilidad por muerte o daños personales resultantes de nuestra negligencia, fraude o representación fraudulenta, o cualquier otra responsabilidad que no pueda ser excluida o limitada por la ley aplicable.',
		},
		indemnification: {
			title: 'Indemnización',
			content:
				'Usted acepta indemnizar, defender y eximir de responsabilidad al Proveedor, sus afiliados, directores, empleados y agentes, de y contra cualquier reclamación, responsabilidad, daño, pérdida o costo (incluyendo honorarios razonables de abogados) que surja de o esté relacionado con: (a) su uso del Sistema POS; (b) su incumplimiento de estos Términos; (c) su violación de cualquier derecho de terceros, incluyendo pero no limitado a derechos de propiedad intelectual o derechos de privacidad; (d) cualquier Contenido que usted introduzca en el sistema.',
		},
		support: {
			title: 'Soporte y Actualizaciones',
			content:
				'El Sistema POS podrá recibir actualizaciones periódicas para mejorar su rendimiento, seguridad y cumplimiento legal. El soporte técnico se ofrece conforme a los planes contratados por cada usuario o empresa. Nos reservamos el derecho de modificar o discontinuar funcionalidades del sistema con un preaviso razonable cuando sea necesario por razones técnicas, legales o comerciales.',
		},
		termination: {
			title: 'Suspensión o Terminación del Servicio',
			content:
				'Cualiera de las partes podrá terminar estos Términos por causa material incumplida por la otra parte que no sea subsanada dentro de 30 días tras notificación por escrito. Podremos suspender o cancelar inmediatamente el acceso al sistema en caso de incumplimiento grave de estos Términos, falta de pago o uso indebido de la plataforma. Tras la terminación, su derecho a utilizar el Sistema POS cesará inmediatamente. Las disposiciones que por su naturaleza deban sobrevivir a la terminación permanecerán vigentes.',
		},
		modifications: {
			title: 'Modificaciones de los Términos',
			content:
				'Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor tras su publicación en el Sistema POS o mediante notificación por correo electrónico. El uso continuado del servicio después de dichas modificaciones constituye su aceptación de los Términos revisados. Si no acepta los Términos modificados, deberá discontinuar el uso del servicio.',
		},
		governingLaw: {
			title: 'Ley Aplicable y Jurisdicción',
			content:
				'Estos Términos se regirán e interpretarán de acuerdo con las leyes de [País/Estado]. Cualquier disputa que surja de o relacione con estos Términos se someterá a la jurisdicción exclusiva de los tribunales de [Ciudad, País/Estado]. La Convención de las Naciones Unidas sobre Contratos para la Venta Internacional de Mercaderías no se aplicará.',
		},
		general: {
			title: 'Disposiciones Generales',
			content:
				'Estos Términos constituyen el acuerdo completo entre las partes respecto al objeto aquí tratado y reemplazan todos acuerdos anteriores. Si cualquier disposición de estos Términos es considerada inválida o inaplicable, las restantes disposiciones mantendrán su plena vigencia. Nuestra falta de exigir el cumplimiento de cualquier disposición no constituirá una renuncia a dicho derecho posteriormente. Usted no podrá ceder o transferir estos Términos sin nuestro consentimiento previo por escrito.',
		},
		acceptance: {
			title: 'Aceptación de los Términos',
			content:
				'Al utilizar este Sistema POS, confirma que ha leído, entendido y aceptado estos Términos y Condiciones en su totalidad. En caso de no estar de acuerdo, deberá abstenerte de usar la plataforma. Si está utilizando el sistema en representación de una empresa u otra entidad legal, declara y garantiza que tiene la autoridad para obligar a dicha entidad a estos Términos.',
		},
	},
}

export async function TermsOfServicePage() {
	return (
		<main className='mx-auto max-w-4xl px-4 py-8'>
			<Card className='w-full border-none bg-transparent p-0'>
				<CardHeader className='p-0'>
					<CardTitle className='text-3xl'>Términos y Condiciones del Sistema POS</CardTitle>
				</CardHeader>

				<CardContent className='space-y-8 p-0'>
					<div className='prose prose-sm max-w-none space-y-8'>
						{Object.entries(terms.sections).map(([key, section]) => (
							<section key={key} className='space-y-3'>
								<h2 className='text-xl font-semibold'>{section.title}</h2>
								<p className='text-muted-foreground leading-relaxed'>{section.content}</p>
							</section>
						))}
					</div>
				</CardContent>
			</Card>
		</main>
	)
}

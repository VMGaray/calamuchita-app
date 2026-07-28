import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "Política de Privacidad | Calamuchita App",
  description: "Política de privacidad y tratamiento de datos personales de Calamuchita App.",
};

export default function PoliticaDePrivacidad() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12 border-b border-neutral-800 pb-8">
          <BackButton
            fallbackHref="/"
            label="Volver"
            className="mb-6 text-sm"
            style={{ color: "rgba(255,255,255,0.55)" }}
          />
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-amber-400">
            Calamuchita App
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Última actualización: 16 de junio de 2026
          </p>
        </header>

        <article className="space-y-10 leading-relaxed text-neutral-300">
          <section>
            <p>
              Esta Política de Privacidad describe cómo Calamuchita App
              (&quot;la App&quot;, &quot;nosotros&quot;) recopila, utiliza y
              protege la información de las personas que usan la plataforma,
              ya sea como usuarios finales, comensales o negocios del
              directorio. Calamuchita App opera bajo Victoria Garay,
              con domicilio en Villa General Belgrano, Córdoba, Argentina, y
              cumple con lo establecido en la Ley N.º 25.326 de Protección de
              los Datos Personales de la República Argentina.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              1. Qué información recopilamos
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <span className="font-medium text-neutral-100">
                  Datos de cuenta:
                </span>{" "}
                nombre, correo electrónico y contraseña (almacenada de forma
                cifrada) al registrarte mediante nuestro sistema de
                autenticación.
              </li>
              <li>
                <span className="font-medium text-neutral-100">
                  Datos de pedidos:
                </span>{" "}
                productos seleccionados, comentarios adicionales y número de
                contacto, utilizados para gestionar el pedido a través de
                WhatsApp con el negocio correspondiente.
              </li>
              <li>
                <span className="font-medium text-neutral-100">
                  Datos de reservas:
                </span>{" "}
                fecha, horario, cantidad de personas y datos de contacto
                necesarios para confirmar una reserva en tiempo real con el
                local elegido.
              </li>
              <li>
                <span className="font-medium text-neutral-100">
                  Datos de negocios:
                </span>{" "}
                información comercial (nombre, dirección, horarios, menú,
                imágenes) que los administradores de cada local cargan en su
                panel de gestión.
              </li>
              <li>
                <span className="font-medium text-neutral-100">
                  Datos técnicos:
                </span>{" "}
                información almacenada localmente en tu dispositivo (carrito
                de compras, preferencias de navegación) para mejorar tu
                experiencia de uso.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              2. Para qué usamos esta información
            </h2>
            <p>
              Utilizamos los datos recopilados para crear y administrar tu
              cuenta, procesar pedidos y reservas, conectar a los usuarios
              con los negocios del Valle de Calamuchita, mostrar el
              directorio y los resultados de búsqueda, mejorar el
              funcionamiento de la App y comunicarnos con vos en caso de
              consultas sobre tu pedido, reserva o cuenta.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              3. Con quién compartimos tu información
            </h2>
            <p>
              Los datos de un pedido o reserva se comparten únicamente con el
              negocio específico al que corresponde, ya que es necesario
              para que pueda atenderlo. Utilizamos proveedores de
              infraestructura tecnológica (Supabase para base de datos y
              autenticación, Vercel para alojamiento) que procesan datos en
              nuestro nombre bajo sus propias políticas de seguridad. No
              vendemos ni cedemos datos personales a terceros con fines
              publicitarios.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              4. Cómo protegemos tu información
            </h2>
            <p>
              Implementamos medidas técnicas razonables para proteger tus
              datos, incluyendo cifrado de contraseñas y políticas de
              seguridad a nivel de base de datos (Row Level Security) que
              restringen el acceso a la información según el tipo de
              usuario. Ningún sistema es 100% infalible, pero trabajamos para
              minimizar riesgos de acceso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              5. Tus derechos
            </h2>
            <p>
              Como titular de tus datos, tenés derecho a acceder, rectificar,
              actualizar o solicitar la eliminación de tu información
              personal. Podés ejercer estos derechos escribiéndonos a{" "}
              <a
                href="mailto:vmg.setup.ai@gmail.com"
                className="text-amber-400 underline hover:text-amber-300"
              >
                vmg.setup.ai@gmail.com
              </a>
              . La Agencia de Acceso a la Información Pública, en su carácter
              de Órgano de Control de la Ley N.º 25.326, tiene la atribución
              de atender las denuncias y reclamos que se interpongan con
              relación al incumplimiento de las normas sobre protección de
              datos personales.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              6. Cookies y almacenamiento local
            </h2>
            <p>
              Usamos almacenamiento local del navegador para recordar el
              contenido de tu carrito de compras y preferencias básicas de
              uso. No utilizamos cookies de seguimiento publicitario de
              terceros.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              7. Cambios en esta política
            </h2>
            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente.
              Cualquier cambio será publicado en esta misma página con la
              fecha de actualización correspondiente.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              8. Contacto
            </h2>
            <p>
              Si tenés preguntas sobre esta política o sobre el tratamiento
              de tus datos, escribinos a{" "}
              <a
                href="mailto:vmg.setup.ai@gmail.com"
                className="text-amber-400 underline hover:text-amber-300"
              >
                vmg.setup.ai@gmail.com
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

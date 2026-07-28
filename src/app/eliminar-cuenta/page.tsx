export const metadata = {
  title: "Eliminar cuenta y datos | Calamuchita App",
  description: "Cómo solicitar la eliminación de tu cuenta y datos en Calamuchita App.",
};

export default function EliminarCuenta() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12 border-b border-neutral-800 pb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-amber-400">
            Calamuchita App
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Eliminar tu cuenta y tus datos
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Última actualización: 17 de junio de 2026
          </p>
        </header>

        <article className="space-y-10 leading-relaxed text-neutral-300">
          <section>
            <p>
              Si querés eliminar tu cuenta de Calamuchita App y los datos
              personales asociados, podés solicitarlo en cualquier momento
              siguiendo los pasos descritos en esta página.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Cómo solicitar la eliminación
            </h2>
            <ol className="ml-5 list-decimal space-y-2">
              <li>
                Enviá un correo a{" "}
                <a
                  href="mailto:vmg.setup.ai@gmail.com?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta"
                  className="text-amber-400 underline hover:text-amber-300"
                >
                  vmg.setup.ai@gmail.com
                </a>{" "}
                desde la misma dirección de correo con la que te registraste
                en la app.
              </li>
              <li>
                En el asunto o cuerpo del mensaje, indicá &quot;Solicitud de
                eliminación de cuenta &ndash; Calamuchita App&quot; y el
                correo asociado a tu cuenta.
              </li>
              <li>
                Vamos a confirmarte por correo la recepción del pedido y a
                procesar la eliminación dentro de los 30 días siguientes.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Qué datos se eliminan
            </h2>
            <p>
              Al procesar tu solicitud, eliminamos tu cuenta de usuario
              (nombre, correo electrónico y contraseña almacenada), así como
              el historial de pedidos y reservas asociado a tu cuenta dentro
              de nuestra base de datos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Qué datos podemos conservar
            </h2>
            <p>
              Es posible que conservemos determinada información durante un
              período adicional cuando exista una obligación legal o
              contable que lo requiera (por ejemplo, registros de
              transacciones vinculados a negocios del directorio), o
              registros agregados y anonimizados que ya no permitan
              identificarte. Estos datos se conservan únicamente el tiempo
              estrictamente necesario para cumplir dicha obligación.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Contacto
            </h2>
            <p>
              Si tenés dudas sobre este proceso, escribinos a{" "}
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
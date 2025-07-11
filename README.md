⚡️Proyecto de Tablero Kanban

Imagina un lugar donde la colaboración fluye sin interrupciones, donde cada miembro de tu equipo está completamente alineado y
cada avance se celebra al instante. Eso es exactamente lo que te ofrece nuestro innovador tablero Kanban. Diseñado para la acción y
la eficiencia, esta herramienta intuitiva te permite gestionar columnas y tarjetas con una facilidad asombrosa, y lo mejor de todo:
cada cambio es visible para todos, en tiempo real. Prepárate para empoderar a tu equipo y ver cómo la productividad se dispara, 
¡creando un ambiente de trabajo verdaderamente positivo y orientado al éxito!

1. Clonar el Repositorio
Abre tu terminal y ejecuta:

Bash

git clone https://github.com/Astridmcf/kanban-pruebatecnica
cd kanban-pruebatecnica

2. Configuración del Frontend (Next.js)
Abre una nueva terminal y navega a la carpeta del frontend:
Bash

cd frontend

Luego, ejecuta los siguientes comandos:
Instalar dependencias:

Bash

npm install


Configurar la URL del Backend:Crea un archivo .env.local en la raíz de la carpeta frontend para apuntar al backend:
NEXT_PUBLIC_API_URL=http://localhost:3001


Iniciar la aplicación del frontend:
Bash
npm run dev

El frontend debería estar accesible en tu navegador, probablemente en http://localhost:3000.

3. Configuración del Backend (NestJS)Primero, asegúrate de tener una instancia de MongoDB ejecutándose y accesible localmente (por ejemplo, en mongodb://localhost:27017). Puedes instalar MongoDB directamente o usar Docker para levantarlo rápidamente.

En otra terminal, navega a la carpeta del backend:

Bash

cd backend

Luego, ejecuta los siguientes comandos en orden:
Instalar dependencias:

Bash

npm install


Configurar variables de entorno:Crea un archivo .env en la raíz de la carpeta backend con la URL de tu base de datos MongoDB.
DATABASE_URL="mongodb://localhost:27017/tu_base_de_datos_kanban"

Importante: Puedes cambiar tu_base_de_datos_kanban por el nombre que prefieras para tu base de datos.
Generar cliente Prisma y sincronizar esquema:
Estos comandos son cruciales para que Prisma pueda interactuar con tu base de datos.

Bash

npx prisma generate
npx prisma db push


Iniciar el servidor del backend:
Bash
npm run start:dev

El backend debería estar funcionando en http://localhost:3001.

Verificación LocalUna vez que ambos servidores estén en ejecución:

Abre tu navegador y visita http://localhost:3000.

Prueba la creación, edición y eliminación de columnas y tarjetas.

Arrastra y suelta tarjetas entre columnas.

Abre la aplicación en dos pestañas/ventanas para verificar la sincronización de cambios en tiempo real.

Observa las notificaciones "toast" al realizar acciones

¡Con estos pasos detallados, podrás tener tu tablero Kanban funcionando localmente en poco tiempo! 

Si tienes alguna otra consulta o encuentras alguna dificultad, no dudes en preguntar al email moleroastricarolina@gmail.com.







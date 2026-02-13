# Documentación General del Proyecto - Mantenimiento

# Intregrantes del proyecto:

- Marcelo Sanchez
- Aldo Carrera
- Gerardo Ramírez
- Martín Serrano

Este documento tiene como objetivo explicar la estructura general del código fuente y las prácticas que seguimos para mantener un desarrollo ordenado, entendible y escalable para todos los integrantes del equipo.

---

## Organización del código

En la raíz del proyecto existe una carpeta llamada `includes`, donde se almacenan **funciones globales**.  
La idea principal es evitar repetir código en diferentes módulos y, en su lugar, centralizar funciones reutilizables para que puedan ser importadas desde los archivos `.js` o `.php` cuando se necesiten.

Esto permite:

- Mantener el archivo principal más ligero y legible.
- Facilitar el mantenimiento y optimización del código.
- Promover reutilización de lógica entre distintos módulos del sistema.

**Nota:** Cualquier integrante del equipo está autorizado a agregar funciones globales, siempre y cuando se documente su uso y propósito de manera clara para facilitar su implementación por otros desarrolladores.

---

## Control de versiones

El proyecto cuenta con un **repositorio activo en Git**, donde se registran los cambios realizados por día.  
Esto nos permite:

- Mantener historial de modificaciones.
- Identificar fácilmente qué integrante hizo un cambio y cuándo.
- Recuperar versiones anteriores si es necesario.
- Trabajar en equipo sin conflictos mediante ramas y commits organizados.

Repositorio de trabajo:  
`https://github.com/RmzGerardo/`

- Usar con responabilidad y antes de clonar, pedir permiso al Jefe inmediato.

---

## Mantenimiento y mejora continua

El código se considera **vivo**, lo que significa que estará en constante revisión y optimización.  
Cada ajuste busca mejorar la claridad, reducir redundancias y mantener una arquitectura limpia que permita escalar el proyecto sin generar desorden.

Se busca aplicar progresivamente mejores prácticas como:

- Separación de responsabilidades por archivo/módulo.
- Comentarios claros solo cuando sean necesarios.
- Estandarización de nombres de funciones y variables.
- Normalizacion de las tablas del proyecto.
- Eliminación de código duplicado o sin uso.

Este documento puede actualizarse conforme el proyecto crezca o se integren nuevas reglas de trabajo o mejoras técnicas.

## Mantenimiento y mejora continua

## Estandarización de Rutas (API Routes)

Con el objetivo de mejorar la mantenibilidad del código y eliminar las cadenas de texto estáticas dispersas por la aplicación, se ha implementado el objeto constante API_ROUTES. Esta práctica centraliza todas las referencias a los archivos PHP del backend en un único lugar, facilitando la refactorización si la estructura de carpetas del servidor cambia en el futuro.

- Uso
  **export const API_ROUTES = { nombre_variable: 'ruta'}/**
- Llamar al funcion
  **const respuesta = await fetch(API_ROUTES.obtenerModulo);/**

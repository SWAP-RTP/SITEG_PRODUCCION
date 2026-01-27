import { RutaDBSWAP } from "../../../../CASETA/interfaces/Rutas";
import {
    groupByRepeatedValue, objectToArray, sortByProperty,
    dateToString, transformarFechaIntl, quitarAcentos, stringIncludes
} from "../../../../shared/helpers";
import { UseFetchGet } from "../../../../shared/helpers-HTTP";
import { CD, Descansos, Err, Err_page, HeaderRol, JoE, Jornadas, Rol, RolWithTurnos, ValRol, PeriodoApi } from "../interfaces";
import { deleteDuplicates, findDuplicates, findDuplicates2, groupByValue } from "./funcsToArrays";
import { rol_validateJornadas } from "./validations";
import { Cell } from "read-excel-file/types";

// Interfaces para tipar datos de credenciales, económicos y rutas
interface Creds_mod { cred: number, servicio?: number | string, seccion?: string, hoja: string }
interface Ecos_inMod { eco: number | string, servicio: string | number, hoja: string }
interface Creds_activas {
    modulo: number;
    credencial: number;
    nombre: string;
    puesto: string;
    puesto_desc: string;
    status: number;
    status_desc: string;
}
interface Creds_incapacidad { cred: number; dias: number; data: Datum[]; }
interface Datum {
    id_concepto: number;
    cred: number;
    dias: number;
    usuario_captura: number;
    fecha_inicio: Date;
    fecha_final: Date;
    create_at: Date;
}
interface Ruta_autorizada {
    id: number;
    nombre: string;
    swap_ruta: string;
    origen_destino: string;
    modalidad: string;
    modalidad_id: number;
}
interface Ecos_estatus { eco: number | string; mod: number; estatus: number; }
interface HeaderRolExcel {
    "periodo": Cell,
    "ori_des": Cell,
    "ruta": Cell,
    "modalidad": Cell,
}

const api_base = import.meta.env.VITE_SUGO_BackTS

/**
 * Clase principal para validar roles y servicios.
 * Contiene métodos para validar jornadas, descansos, credenciales, económicos, encabezados, etc.
 */
export class ValidarRoles {
    // Propiedades para almacenar datos de referencia y resultados de fetch
    creds_Activas: Creds_activas[] = [];
    creds_Incapacidad: Creds_incapacidad[] = [];
    ecos_NoBaja: Ecos_estatus[] = [];
    rutas_autorizadas: Ruta_autorizada[] = [];
    rutas_swapXmod: RutaDBSWAP[] = [];
    periodo_sig?: PeriodoApi;
    fetchError?: string;

    constructor() {
        // Inicializa arrays para evitar errores en métodos .find/.map
    }

    /**
     * Realiza fetch de datos necesarios para validaciones.
     * Obtiene rutas, operadores, periodos, económicos, etc.
     */
    async doFetch(mod: number, periodo: PeriodoApi) {
        const fechaHoy = dateToString(new Date(), true);
        try {
            // Ejecuta todas las promesas en paralelo
            const [rutasRes, ccModuloRes, op_activosRes, op_incapacidadRes, ecos_estatusRes] = await Promise.all([
                UseFetchGet(`${api_base}/api/swap/rutas`),
                UseFetchGet(`${api_base}/api/swap/rutas?modulo=${mod}`),
                UseFetchGet(`${api_base}/api/swap/operadores?modulo=${mod}&estado=1&puesto=Operadores`),
                UseFetchGet(`${api_base}/api/swap/incapacidad?fecha=${fechaHoy}&concepto=6`),
                UseFetchGet(`${api_base}/api/swap/ecos/estado?modulo=${mod}&estado=1,2`)
            ]);
            // Helper para extraer arrays de la respuesta
            const extractArray = (r: any): any[] => {
                if (!r) return [];
                if (Array.isArray(r)) return r;
                if (typeof r === 'object') {
                    if (Array.isArray(r.data)) return r.data;
                    for (const v of Object.values(r)) if (Array.isArray(v)) return v as any[];
                    const vals = Object.values(r);
                    if (vals.length > 0 && vals.every((x, i) => String(i) in r)) return vals as any[];
                }
                return [];
            };
            // Asigna datos obtenidos
            this.rutas_autorizadas = extractArray(rutasRes);
            this.rutas_swapXmod = extractArray(ccModuloRes);
            this.creds_Activas = extractArray(op_activosRes);
            this.creds_Incapacidad = extractArray(op_incapacidadRes);
            this.ecos_NoBaja = extractArray(ecos_estatusRes);
            this.periodo_sig = periodo;
            this.fetchError = undefined;
            return true;
        } catch (error) {
            console.error('doFetch error:', error);
            this.fetchError = (error && (error.message || String(error))) || 'Error al obtener datos de referencia';
            // Asegura arrays vacíos en caso de error
            this.rutas_autorizadas = [];
            this.rutas_swapXmod = [];
            this.creds_Activas = [];
            this.creds_Incapacidad = [];
            this.ecos_NoBaja = [];
            return false;
        }
    }

    /**
     * Valida si hay datos en el cuerpo del rol.
     * Retorna errores si no hay servicios, cubre descansos o jornadas excepcionales.
     */
    hasBodyRolData(rol: RolWithTurnos[], cd: CD[], joe: JoE[]): Err[] {
        const bodyRolErrors: Err[] = [];
        if (rol.length === 0 && cd.length === 0 && joe.length === 0)
            bodyRolErrors.push({ msg: '*** No hay informacion para validar ***' });
        else if (rol.length === 0)
            bodyRolErrors.push({ msg: '** Rol sin servicios para validar **' });
        return bodyRolErrors;
    }

    /**
     * Valida jornadas/turnos según el tipo de día (L-V, Sábado, Domingo).
     * Retorna errores si hay problemas en la programación de jornadas.
     */
    jornada(rol: RolWithTurnos[]): Err[] {
        return rol.map(s => {
            const err: string[][] = [];
            if (s.lun_vie) err.push(rol_validateJornadas({ jornadas: s.lun_vie, cred: s.credenciales }, 'Lunes a viernes'));
            if (s.sab) err.push(rol_validateJornadas({ jornadas: s.sab, cred: s.credenciales }, 'Sabado'));
            if (s.dom) err.push(rol_validateJornadas({ jornadas: s.dom, cred: s.credenciales }, 'Domingo'));
            return { msg: `Error en servicio ${s.servicio}`, desc: err.flat() };
        }).filter(i => i.desc.length > 0);
    }

    /**
     * Valida que cada servicio tenga dos descansos en la semana.
     * Retorna errores si no se cumplen los descansos requeridos.
     */
    descansos(servicios: RolWithTurnos[] | CD[]): Err[] {
        return servicios.map(s => {
            if (!s.descansos || Object.keys(s.descansos).length === 0)
                return { msg: `Error en servicio ${s.servicio}`, desc: ['No se encontro calendario con descansos'] };
            const diasDescanso = objectToArray(s.descansos).map(dia => dia[1] === 'D' ? dia[0] : undefined).filter(Boolean);
            if (diasDescanso.length !== 2)
                return { msg: `Error en servicio ${s.servicio}`, desc: ['No tiene 2 descansos en la semana'] };
            return null;
        }).filter(Boolean) as Err[];
    }

    /**
     * Valida que los servicios a cubrir en CD existan en el rol y tengan programación.
     * Retorna errores si no se encuentran los servicios o no tienen programación.
     */
    existeTurno(cd: CD[], rol: RolWithTurnos[]): Err[] {
        if (cd.length === 0) return [];
        return cd.map(s => {
            const msg_err = `Error en servicio ${s.servicio}`;
            if (!s.descansos || Object.keys(s.descansos).length === 0)
                return { msg: msg_err, desc: ['No se encontro calendario con servicios a cubrir'] };
            const err_desc: string[] = [];
            Object.entries(s.descansos).forEach(([dia, servicioAcubrir]) => {
                if (servicioAcubrir && !Number(servicioAcubrir) && servicioAcubrir !== 'D')
                    return err_desc.push(`Se debe usar el numero de un servicio en el dia ${dia}, se coloco: ${JSON.stringify(servicioAcubrir)} `);
                if (servicioAcubrir === 'D') return;
                const servicioDelRol = rol.find(({ servicio }) => servicio === servicioAcubrir);
                if (!servicioDelRol)
                    return err_desc.push(`No se encontro el servicio ${servicioAcubrir} para cubrir en el dia ${dia}`);
                if (!Object.keys(servicioDelRol.descansos).includes(dia))
                    return err_desc.push(`El servicio ${servicioDelRol.servicio} no descansa el dia ${dia}`);
                if (dia === 'sabado' && !servicioDelRol.sab)
                    return err_desc.push(`No se tiene programacion para el ${dia}`);
                else if (dia === 'domingo' && !servicioDelRol.dom)
                    return err_desc.push(`No se tiene programacion para el ${dia}`);
                else if (!['sabado', 'domingo'].includes(dia) && !servicioDelRol.lun_vie)
                    return err_desc.push(`No se tiene programacion para el ${dia}`);
            });
            if (err_desc.length !== 0) return { msg: msg_err, desc: err_desc };
            return null;
        }).filter(Boolean) as Err[];
    }

    /**
     * Valida nomenclatura de tipo de sistema (E/S o T/F).
     * Retorna errores si el tipo de sistema no es válido.
     */
    nomenclaturaES(servicios: RolWithTurnos[] | CD[]): Err[] {
        const datosValidos = ['E/S', 'T/F'];
        return servicios.map(s => {
            if (!s.sistema)
                return { msg: `Error en servicio ${s.servicio}`, desc: ['No se encontro el dato de tipo de sistema (E/S o T/F)'] };
            if (!datosValidos.includes(s.sistema))
                return { msg: `Error en servicio ${s.servicio}`, desc: [`El tipo de sistema debe ser ${datosValidos.join(' o ')} `] };
            return null;
        }).filter(Boolean) as Err[];
    }

    /**
     * Valida nomenclatura de CC (lugares de inicio/termino) contra la ruta autorizada.
     * Retorna errores si los lugares no coinciden con los esperados por la ruta.
     */
    nomenclaturaCC(servicios: RolWithTurnos[], header: HeaderRol): Err[] {
        // console.log('Validando nomenclatura CC para la ruta:', header.ruta);
        const rutaAutorizada = this.rutas_autorizadas.find(rutaAut =>
           rutaAut.nombre === header.ruta ||
           rutaAut.swap_ruta === header.ruta
        );
        // Si no se encontró la ruta autorizada, devuelve error y no sigas
        console.log('servicios', servicios);
        if (!rutaAutorizada) {
            return servicios.map(s => ({
                msg: `Error en servicio ${s.servicio}`,
                desc: [`No se encontró la ruta autorizada para "${header.ruta}". No se puede validar CC.`]
            }));
        }
        const ccMod = this.rutas_swapXmod.filter(rutaSwap => rutaSwap.nombre == rutaAutorizada.nombre || rutaSwap.nombre == rutaAutorizada.swap_ruta);
        // console.log('rutas: ', ccMod);
        
        // Calcula ccDelaRuta una sola vez
        const ccDelaRuta = [...new Set(ccMod.flatMap(obj => [obj.cc_des, obj.cc_ori]).filter(Boolean))];
        const getErr_desc = (tipo: string, arr?: Jornadas[]) => {
            if (!arr || arr.length == 0) return [];
            return arr.flatMap(obj => {
                const { lug_ini_cc, lug_ter_cc, turno } = obj;
                const errors: string[] = [];
                const isOk1 = typeof lug_ini_cc === 'string' && ccDelaRuta.includes(lug_ini_cc.trim());
                const isOk2 = typeof lug_ter_cc === 'string' && ccDelaRuta.includes(lug_ter_cc.trim());
                if (!isOk1) errors.push(`El lugar de INICIO especificado [${lug_ini_cc}] del turno ${turno} en ${tipo} no coincide con alguno de los esperados por la ruta ${header.ruta || ''}. [ ${ccDelaRuta.join(', ')} ]`)
                if (!isOk2) errors.push(`El lugar de TERMINO especificado [${lug_ter_cc}] del turno ${turno} en ${tipo} no coincide con alguno de los esperados por la ruta ${header.ruta || ''}. [ ${ccDelaRuta.join(', ')} ]`)
                return errors.length > 0 ? errors : [];
            });
        };
        return servicios.map(s => {
            const err_desc_LV = getErr_desc('Lunes a Viernes', s.lun_vie);
            const err_desc_Sab = getErr_desc('Sabado', s.sab);
            const err_desc_Dom = getErr_desc('Domingo', s.dom);
            const desc = [...err_desc_LV, ...err_desc_Sab, ...err_desc_Dom];
            return desc.length > 0 ? { msg: `Error en servicio ${s.servicio}`, desc } : null;
        }).filter(Boolean) as Err[];
    }

    /**
     * Valida credenciales repetidas en todas las hojas y secciones.
     * Retorna errores si encuentra operadores duplicados.
     */
    credencialesRepetidas(data: ValRol[]): Err | null {
        const credRepetidas: Creds_mod[] = [];
        const credsVistas: Creds_mod[] = [];
        // Helper para procesar credenciales de cada sección
        const processCreds = (arr: any[], hoja: string, seccion?: string) => arr.map(s => {
            const creds = Object.values(s.credenciales || {});
            creds.forEach(cred => {
                const credAppear = credsVistas.find(c => c.cred === cred);
                if (credAppear) {
                    credRepetidas.push(credAppear, { cred, servicio: s.servicio, hoja, seccion });
                }
                credsVistas.push({ cred, servicio: s.servicio, hoja, seccion });
            });
        });
        data.forEach(({ hoja, data }) => {
            if (!data) return;
            processCreds(data.rol, hoja);
            processCreds(data.cd, hoja);
            data.joe.forEach(s => {
                const credAppear = credsVistas.find(c => c.cred === s.cred);
                if (credAppear) credRepetidas.push(credAppear, { cred: s.cred, seccion: 'Jornada excepcional', hoja });
                credsVistas.push({ cred: s.cred, seccion: 'Jornada excepcional', hoja });
            });
        });
        if (credRepetidas.length === 0) return null;
        const credRepetidasOrdered = sortByProperty(credRepetidas, 'cred');
        const credsSinDuplicados = deleteDuplicates(credRepetidasOrdered, ['hoja', 'cred']);
        const credsDuplicadas = groupByRepeatedValue(credsSinDuplicados, 'cred');
        const mensajesError = credsDuplicadas.map(obj => {
            const cred = obj[0].cred;
            const msg = obj.map(o => o.servicio ? `en el servicio ${o.servicio} de la hoja ${o.hoja}` : `en la seccion de ${o.seccion} de la hoja ${o.hoja}`);
            const internacionalizacion = new (Intl as any).ListFormat('es');
            return `La credencial ${cred} ${internacionalizacion.format(msg)}`;
        });
        return { msg: 'Operadores duplicados', desc: mensajesError };
    }

    /**
     * Obtiene todas las credenciales y económicos de los datos.
     * Retorna un objeto con arrays de credenciales y económicos.
     */
    getCredsAndEcos(data: ValRol[]) {
        const ecos: Ecos_inMod[] = [];
        const credsDelModulo = data.map(({ hoja, data }) => {
            if (!data) return null;
            const { rol, joe, cd } = data;
            rol.forEach(s => { if (s.eco) ecos.push({ eco: s.eco, servicio: s.servicio, hoja }); });
            cd.forEach(s => { if (s.eco) ecos.push({ eco: s.eco, servicio: s.servicio, hoja }); });
            const credsRol = rol.map(s => Object.values(s.credenciales).map(cred => ({ cred, servicio: s.servicio, hoja }))).flat();
            const credsCD = cd.map(s => Object.values(s.credenciales).map(cred => ({ cred, servicio: s.servicio, hoja }))).flat();
            const credsJoE: Creds_mod[] = joe.map(s => ({ cred: s.cred, seccion: `Jornada excepcional`, hoja }));
            return [...credsRol, ...credsCD, ...credsJoE];
        }).filter(Boolean).flat(5);
        return { creds: credsDelModulo as Creds_mod[], ecos };
    }

    /**
     * Valida si alguna credencial tiene incapacidad.
     * Retorna errores si encuentra operadores con incapacidad.
     */
    credsIncapacidad(data: ValRol[]): Err | null {
        const { creds } = this.getCredsAndEcos(data);
        const credsConIncap = creds.filter(c => this.creds_Incapacidad.map(ci => ci.cred).includes(c.cred));
        if (credsConIncap.length === 0) return null;
        const msg_err = credsConIncap.map(c => c.seccion
            ? `La credencial ${c.cred} en la seccion de ${c.seccion} en la hoja ${c.hoja}`
            : `La credencial ${c.cred} en el servicio ${c.servicio} en la hoja ${c.hoja}`
        );
        return { msg: 'Operadores con incapacidad', desc: msg_err as string[] };
    }

    /**
     * Valida si alguna credencial no está activa en el módulo.
     * Retorna errores si encuentra operadores no adscritos al módulo.
     */
    credsActivas(data: ValRol[]): Err | null {
        const { creds } = this.getCredsAndEcos(data);
        const credsActivas = this.creds_Activas.map(c => c.credencial);
        const credsNoActivas = creds.filter(c => !credsActivas.includes(c.cred));
        if (credsNoActivas.length === 0) return null;
        const msg_err = credsNoActivas.map(c => c.seccion
            ? `La credencial ${c.cred} en la sección de ${c.seccion} en la hoja ${c.hoja}`
            : `La credencial ${c.cred} en el servicio ${c.servicio} en la hoja ${c.hoja}`
        );
        return { msg: 'Operadores no adscritos al modulo', desc: msg_err as string[] };
    }

    /**
     * Valida económicos repetidos en los servicios.
     * Retorna errores si encuentra económicos duplicados.
     */
    ecosRepetidos(data: ValRol[]): Err | null {
        const { ecos } = this.getCredsAndEcos(data);
        const ecos_Duplicados = findDuplicates2(ecos, 'eco');
        const ecos_Sorted = sortByProperty(ecos_Duplicados, 'eco');
        const ecos_Grouped = groupByRepeatedValue(ecos_Sorted, 'eco');
        if (ecos_Grouped.length > 0) {
            const mensajesError = ecos_Grouped.map(obj => {
                const eco = obj[0].eco;
                const msg = obj.map(o => `${o.servicio} de la hoja ${o.hoja}`);
                const internacionalizacion = new (Intl as any).ListFormat('es');
                return `Economico ${eco} en los servicios ${internacionalizacion.format(msg)}`;
            });
            return { msg: 'Economicos repetidos', desc: mensajesError };
        }
        return null;
    }

    /**
     * Valida económicos que están en baja.
     * Retorna errores si encuentra económicos en baja.
     */
    ecosBaja(data: ValRol[]): Err | null {
        const { ecos } = this.getCredsAndEcos(data);
        const ecosActivos = this.ecos_NoBaja.map(obj => obj.eco);
        const ecos_rolEnBaja = ecos.filter(obj => !ecosActivos.includes(Number(obj.eco)));
        if (ecos_rolEnBaja.length > 0) {
            const mensajes = ecos_rolEnBaja.map(obj => `El economico ${obj.eco} del servicio ${obj.servicio} en la hoja ${obj.hoja}`);
            return { msg: 'Economicos que estan en baja', desc: mensajes };
        }

        return null;
    }

    /**
     * Valida encabezado del rol: ruta, modalidad, origen-destino y periodo.
     * Retorna errores críticos y normales, y los datos del periodo/ruta/modalidad si todo es correcto.
     */
    encabezadoRol(header: HeaderRolExcel): [
        { errorsCriticos: Err[], errors: Err[] } | null,
        { periodo_id: number, ruta_id: number, modalidad_id: number, periodo_date_ini: Date | string, periodo_date_fin: Date | string } | undefined
    ] {
        const errors: Err[] = []
        const errorsCriticos: Err[] = []
        const { modalidad, ori_des, periodo, ruta } = header
        const rutasAutorizadas = this.rutas_autorizadas

        //^ Validaciones: Ruta
        if (!ruta || !(typeof ruta == 'string' || typeof ruta == 'number')) {
            errorsCriticos.push({ msg: 'Hace falta RUTA en el encabezado' })
            return [{ errorsCriticos, errors }, undefined]
        }

        const rutaAut = rutasAutorizadas.find(r => r.nombre == ruta || r.swap_ruta == ruta);
        if (!rutaAut) {
            errorsCriticos.push({ msg: `La ruta ${ruta} no esta en la lista de rutas autorizadas` })
            return [{ errorsCriticos, errors }, undefined]
        }
        const { id: ruta_id, modalidad: modAut, modalidad_id, origen_destino: oriDesAut } = rutaAut

        //^ Validaciones: Modalidad
        if (!modalidad || typeof modalidad != 'string') {
            errorsCriticos.push({ msg: 'Hace falta MODALIDAD en el encabezado' })
        } else {
            if ((modalidad as string).toUpperCase() != modAut.toUpperCase()) errorsCriticos.push({ msg: `La modalidad ${modalidad} no coincide con la de la ruta autorizada que es ${modAut}` })
        }

        //^ Validaciones: Origen-Destino
        if (!ori_des || typeof ori_des != 'string') {
            errors.push({ msg: 'Hace falta ORIGEN-DESTINO en el encabezado' })
        } else if (!oriDesAut || typeof oriDesAut !== 'string') {
            errors.push({ msg: 'No se encontró ORIGEN-DESTINO en la ruta autorizada' })
        } else {
            // Solo llamar quitarAcentos si ambos son string
            const oriAut = quitarAcentos(oriDesAut).split('-');
            const ori_d = quitarAcentos(ori_des).split('-');
            const coincideOrigen = (typeof ori_d[0] == 'string' && oriAut[0] == ori_d[0].trim());
            const coincideDestino = (typeof ori_d[1] == 'string' && oriAut[1] == ori_d[1].trim());
            if (!coincideOrigen || !coincideDestino) {
                const desc: string[] = []
                if (!coincideOrigen) desc.push(`Se coloco de origen ${ori_d[0]} y debe ser ${oriAut[0].toUpperCase()}`)
                if (!coincideDestino) desc.push(`Se coloco de destino ${ori_d[1]} y debe ser ${oriAut[1].toUpperCase()}`)
                errors.push({ msg: `El ORIGEN-DESTINO no coincide con la de la ruta autorizada`, desc })
            }
        }

        //^ Validaciones: Periodo
        const { id: periodo_id, fecha_inicio, fecha_fin } = this.periodo_sig
        if (!periodo || typeof periodo != 'string') {
            errors.push({ msg: 'Hace falta PERIODO en el encabezado' })
        } else {
            const desc: string[] = []
            const [f1, f2] = [fecha_inicio.split('-').join('/'), fecha_fin.split('-').join('/')]
            const [fe1, fe2] = [transformarFechaIntl(f1), transformarFechaIntl(f2)]
            const [isOk1, isOk2] = [stringIncludes(periodo, fe1), stringIncludes(periodo, fe2)]
            //! error normal: Periodo no corresponde
            if (!isOk1 || !isOk2) {
                if (!isOk1) desc.push(`El periodo debe iniciar el: ${fe1.toUpperCase()}`)
                if (!isOk2) desc.push(`El periodo debe terminar el: ${fe2.toUpperCase()}`)
                errors.push({ msg: `El periodo que se introdujo es incorrecto [${periodo}]`, desc })
            }
        }

        if (errorsCriticos.length > 0 || errors.length > 0) return [{ errorsCriticos, errors }, undefined]

        return [null, { ruta_id, modalidad_id, periodo_id, periodo_date_ini: fecha_inicio, periodo_date_fin: fecha_fin }]
    }
}
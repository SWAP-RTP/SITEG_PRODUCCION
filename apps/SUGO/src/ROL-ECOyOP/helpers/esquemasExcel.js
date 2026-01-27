import { ajustarHora } from "../../shared/helpers"

export const propuesta1 = {
    //'Lo que lee de excel': 'como lo nombra'
            "No Servicio": 'servicio',
            'Economico': 'economico',
            'No de credenciales': {         // No es necesario que coincida con lo de excel, solo es para tener agrupado lo de debajo
                'credenciales': {           // Se agrupará dentro de 'credenciales' y solo puedetener una propiedad
                    '1er Turno': 'turno1cred',
                    '2do Turno': 'turno2cred',
                    '3er Turno': 'turno3cred',
                } 
            },
            'Sistema': 'sistema',
            'Descansos': {'descansos': {
                'L': 'lunes',
                'M': 'martes',
                'Mi': 'mier',
                'J': 'jueves',
                'V': 'viernes',
                'S': 'sabado',
                'D': 'domingo',
            }},
            'Primer turno': { 'turno1':{
                '1er Turno': 'cred1',
    
                'Inicio 1er Turno': 'hrInicio1',	
                'Salida Modulo': 'hrSalidaMod',	
                'Inicio CC': 'hrInicioCC', 	
                'Lugar Inicio':	'lugInicio1',
                'Termino de labores': 'hrTermino1',	
                'Lugar Termino': 'lugTermino1'
            }},
            'Segundo turno': { 'turno2':{
                '2do Turno': 'cred2',
    
                'Inicio 2do Turno': 'hrInicio2',	
                'Lugar Inicio 2do Turno': 'lugInicio2',	
                'Termino 2do Turno': 'hrTermino2',	
                'Lugar termino 2do Turno': 'lugTermino2'
            }},
            'Tercer turno': { 'turno3':{
                '3er Turno': 'cred3',
    
                'Inicio 3er Turno': 'hrInicio3',	
                'Lugar Inicio 3er Turno': 'lugInicio3',	
                'Termino 3er Turno': 'hrTermino3',	
            }},
            'Termino en Modulo': 'hrTerminoMod',
    //^ Indezar indexados, ejemplo.
            'Turnos': {
                'turnos': {
                    'Primer turno': { 'turno1':{
                        '1er Turno': 'cred1',       // turno1cred == cred1 obtenido de la col '1er Turno' del excel
    
                        'Inicio 1er Turno': 'hrInicio1',	
                        'Salida Modulo': 'hrSalidaMod',	
                        'Inicio CC': 'hrInicioCC', 	
                        'Lugar Inicio':	'lugInicio1',
                        'Termino de labores': 'hrTermino1',	
                        'Lugar Termino': 'lugTermino1'
                    }},
                    'Segundo turno': { 'turno2':{
                        '2do Turno': 'cred2',       // turno2cred == cred2 obtenido de la col '2do Turno' del excel
    
                        'Inicio 2do Turno': 'hrInicio2',	
                        'Lugar Inicio 2do Turno': 'lugInicio2',	
                        'Termino 2do Turno': 'hrTermino2',	
                        'Lugar termino 2do Turno': 'lugTermino2'
                    }},
                    'Tercer turno': { 'turno3':{
                        '3er Turno': 'cred3',       // turno3cred == cred3 obtenido de la col '3er Turno' del excel
    
                        'Inicio 3er Turno': 'hrInicio3',	
                        'Lugar Inicio 3er Turno': 'lugInicio3',	
                        'Termino 3er Turno': 'hrTermino3',	
                    }},
                }
            },
            
        }

export const propuesta2 = {
    //'Lo que lee de excel': 'como lo nombra'
            "No": 'servicio',
            'Economico': 'economico',
            'No de credenciales': {         // No es necesario que coincida con lo de excel, solo es para tener agrupado lo de debajo
                'credenciales': {           // Se agrupará dentro de 'credenciales' y solo puedetener una propiedad
                    '1er Turno': 'turno1cred',
                    'Relevo': 'turno2cred',
                    '2do relevo': 'turno3cred',
                } 
            },
            'Sistema': 'sistema',
            'Descansos': {'descansos': {
                'L': 'lunes',
                'M': 'martes',
                'Mi': 'mier',
                'J': 'jueves',
                'V': 'viernes',
                'S': 'sabado',
                'D': 'domingo',
            }},
            'Primer turno': { 'turno1':{
                '1er Turno': 'cred1',
    
                'Inicio 1er Turno': 'hrInicio1',	
                'Salida Modulo': 'hrSalidaMod',	
                'Inicio CC': 'hrInicioCC', 	
                'Lugar Inicio':	'lugInicio1',
                'Termino de labores': 'hrTermino1',	
                'Lugar Termino': 'lugTermino1'
            }},
            'Segundo turno': { 'turno2':{
                '2do Turno': 'cred2',
    
                'Inicio 2do Turno': 'hrInicio2',	
                'Lugar Inicio 2do Turno': 'lugInicio2',	
                'Termino 2do Turno': 'hrTermino2',	
                'Lugar termino 2do Turno': 'lugTermino2'
            }},
            'Tercer turno': { 'turno3':{
                '3er Turno': 'cred3',
    
                'Inicio 3er Turno': 'hrInicio3',	
                'Lugar Inicio 3er Turno': 'lugInicio3',	
                'Termino 3er Turno': 'hrTermino3',	
            }},
            'Termino en Modulo': 'hrTerminoMod',
    //^ Indezar indexados, ejemplo.
            'Turnos': {
                'turnos': {
                    'Primer turno': { 'turno1':{
                        '1er Turno': 'cred1',       // turno1cred == cred1 obtenido de la col '1er Turno' del excel
    
                        'Inicio 1er Turno': 'hrInicio1',	
                        'Salida Modulo': 'hrSalidaMod',	
                        'Inicio CC': 'hrInicioCC', 	
                        'Lugar Inicio':	'lugInicio1',
                        'Termino de labores': 'hrTermino1',	
                        'Lugar Termino': 'lugTermino1'
                    }},
                    'Segundo turno': { 'turno2':{
                        '2do Turno': 'cred2',       // turno2cred == cred2 obtenido de la col '2do Turno' del excel
    
                        'Inicio 2do Turno': 'hrInicio2',	
                        'Lugar Inicio 2do Turno': 'lugInicio2',	
                        'Termino 2do Turno': 'hrTermino2',	
                        'Lugar termino 2do Turno': 'lugTermino2'
                    }},
                    'Tercer turno': { 'turno3':{
                        '3er Turno': 'cred3',       // turno3cred == cred3 obtenido de la col '3er Turno' del excel
    
                        'Inicio 3er Turno': 'hrInicio3',	
                        'Lugar Inicio 3er Turno': 'lugInicio3',	
                        'Termino 3er Turno': 'hrTermino3',	
                    }},
                }
            },
            
        }

export const propuesta3 = {

    "No": 'servicio',
    'Economico': 'economico',
    'No de credenciales': {         
        'credenciales': {           
            '1er Turno': 'turno1cred',
            'Relevo': 'turno2cred',
            '2do relevo': 'turno3cred',
        } 
    },
    'Sistema': 'sistema',
    'Descansos': {'descansos': {
        'L': 'lunes',
        'M': 'martes',
        'Mi': 'mier',
        'J': 'jueves',
        'V': 'viernes',
        'S': 'sabado',
        'D': 'domingo',
    }},
    'Primer turno': { 'turno1':{
        '1er Turno': 'cred1',

        'Hora inicio 1er Turno': 'hrInicio1',	
        //* 'Salida Modulo': 'hrSalidaMod',  // hrInicio1 +10 min	
        'Hora inicio CC': 'hrInicioCC', 	
        'Lugar Inicio':	'lugInicio1',
        'Hora termino': 'hrTermino1',	
        //* 'Lugar Termino': 'lugTermino1'   // Lugar inicio de relevo | Lugar CC termino
        //! ---------- ----------  SABADO ----------  ----------  
        'Hora inicio 1er Turno __sabado__': 's_hrInicio1',	
        //* 'Salida Modulo __sabado__': 's_hrSalidaMod',  // hrInicio1 +10 min	
        'Hora inicio CC __sabado__': 's_hrInicioCC', 	
        'Lugar Inicio __sabado__': 's_lugInicio1',
        'Hora termino __sabado__': 's_hrTermino1',	
        //* 'Lugar Termino': 's_lugTermino1'   // Lugar inicio de relevo | Lugar CC termino
        
        //! ---------- ----------  DOMINGO ----------  ----------  
        'Hora inicio 1er Turno __domingo__': 'd_hrInicio1',	
        //* 'Salida Modulo __domingo__': 'd_hrSalidaMod',  // hrInicio1 +10 min	
        'Hora inicio CC __domingo__': 'd_hrInicioCC', 	
        'Lugar Inicio __domingo__': 'd_lugInicio1',
        'Hora termino __domingo__': 'd_hrTermino1',	
        //* 'Lugar Termino __domingo__': 'd_lugTermino1'   // Lugar inicio de relevo | Lugar CC termino
    }},
    'Segundo turno': { 'turno2':{
        'Relevo': 'cred2',

        'Hora inicio relevo': 'hrInicio2',	
        'Lugar Inicio relevo': 'lugInicio2',	
        'Hora termino relevo': 'hrTermino2',	
        //* 'Lugar termino 2do Turno': 'lugTermino2'   // Lugar inicio de 2do relevo | Lugar CC termino

        //! ---------- ----------   SABADO ----------  ----------  
        'Hora inicio relevo __sabado__': 's_hrInicio2',	
        'Lugar Inicio relevo __sabado__': 's_lugInicio2',	
        'Hora termino relevo __sabado__': 's_hrTermino2',	
        //* 'Lugar termino 2do Turno __sabado__': 's_lugTermino2'   // Lugar inicio de 2do relevo | Lugar CC termino
        
        //! ---------- ----------   DOMINGO ----------  ----------  
        'Hora inicio relevo __domingo__': 'd_hrInicio2',	
        'Lugar Inicio relevo __domingo__': 'd_lugInicio2',	
        'Hora termino relevo __domingo__': 'd_hrTermino2',	
        //* 'Lugar termino 2do Turno __domingo__': 'd_lugTermino2'   // Lugar inicio de 2do relevo | Lugar CC termino
    }},
    'Tercer turno': { 'turno3':{
        '2do relevo': 'cred3',

        'Lugar Inicio 2do relevo': 'lugInicio3',	
        'Inicio 2do relevo': 'hrInicio3',	
        //* 'Hora termino 2do relevo': 'hrTermino3',   // Termino del turno	
        'Lugar Inicio 2do relevo __sabado__': 's_lugInicio3',	
        'Inicio 2do relevo __sabado__': 's_hrInicio3',	
        'Lugar Inicio 2do relevo __domingo__': 'd_lugInicio3',	
        'Inicio 2do relevo __domingo__': 'd_hrInicio3',	
        
    }},
    'Termino': { 'termino':{	
        'Hora': 'hrTerminoCC',	
        'Lugar CC': 'lugTermioCC',	
        'Termino en Modulo': 'hrTerminoMod',	
        'Termino del turno': 'hrTerminoFinal',	
    }},
    
}


export const propuesta21 = {
    "No": { prop: 'servicio', type: String, required: true },
    'Economico': { prop: 'economico', type: String },

    '1er Turno': {prop: 'turno1cred', type: String},
    'Relevo': {prop: 'turno2cred', type: String},
    '2do relevo': {prop: 'turno3cred', type: String},
    'Sistema': { prop: 'sistema', type: String },

    'L': {prop: 'lunes', type: String},
    'M': {prop: 'martes', type: String},
    'Mi': {prop: 'miercoles', type: String},
    'J': {prop: 'jueves', type: String},
    'V': {prop: 'viernes', type: String},
    'S': {prop: 'sabado', type: String},
    'D': {prop: 'domingo', type: String},

    'Primer turno': { 
        prop: 'turno1',
        type: {
            '1er Turno': {prop: 'cred1', type: String},

            'Hora inicio 1er Turno':            {prop: 'hrInicio1', type: (val) => ajustarHora(val) },	
            'Hora inicio CC':                   {prop: 'hrInicioCC', type: (val) => ajustarHora(val) },
            'Lugar Inicio':	                    {prop: 'lugInicio1', type: String},
            'Hora termino':                     {prop: 'hrTermino1', type: (val) => ajustarHora(val)},	
            'Lugar Inicio relevo':              {prop: 'lugTermino1', type: String},
            
            'Hora inicio 1er Turno __sabado__': {prop: 's_hrInicio1', type: (val) => ajustarHora(val) }, 	
            'Hora inicio CC __sabado__':        {prop: 's_hrInicioCC', type: (val) => ajustarHora(val) },  	
            'Lugar Inicio __sabado__':          {prop: 's_lugInicio1', type: String }, 
            'Hora termino __sabado__':          {prop: 's_hrTermino1', type: (val) => ajustarHora(val) }, 	
            'Lugar Inicio relevo __sabado__':   {prop: 's_lugTermino1', type: String},
            
            'Hora inicio 1er Turno __domingo__':{prop: 'd_hrInicio1', type: (val) => ajustarHora(val) }, 	
            'Hora inicio CC __domingo__':       {prop: 'd_hrInicioCC', type: (val) => ajustarHora(val) },  	
            'Lugar Inicio __domingo__':         {prop: 'd_lugInicio1', type: String }, 
            'Hora termino __domingo__':         {prop: 'd_hrTermino1', type: (val) => ajustarHora(val) }, 
            'Lugar Inicio relevo __domingo__':  {prop: 'd_lugTermino1', type: String},
    }},
    'Segundo turno': { 
        prop: 'turno2',
        type: {
            'Relevo': {prop: 'cred2', type: String},

            "Lugar Inicio relevo":	                {prop: 'lugInicio2', type: String},
            "Hora inicio relevo":                   {prop: 'hrInicio2', type: (val) => ajustarHora(val) },
            "Lugar Inicio 2do relevo":	            {prop: 'lugTermino2', type: String},
            "Hora termino relevo":                  {prop: 'hrTermino2', type: (val) => ajustarHora(val)},	
            
            
            'Lugar Inicio relevo __sabado__':       {prop: 's_lugInicio2', type: String }, 
            "Hora inicio relevo __sabado__":        {prop: 's_hrInicio2', type: (val) => ajustarHora(val) },
            'Hora termino relevo __sabado__':       {prop: 's_hrTermino2', type: (val) => ajustarHora(val) }, 	
            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugTermino2', type: String},
            
            'Lugar Inicio relevo __domingo__':       {prop: 'd_lugInicio2', type: String }, 
            "Hora inicio relevo __domingo__":        {prop: 'd_hrInicio2', type: (val) => ajustarHora(val) },
            'Hora termino relevo __domingo__':       {prop: 'd_hrTermino2', type: (val) => ajustarHora(val) }, 	
            "Lugar Inicio 2do relevo __domingo__":   {prop: 'd_lugTermino2', type: String},
    }},
    'Tercer turno': { 
        prop: 'turno3',
        type: {
            '2do relevo': {prop: 'cred3', type: String},

            "Lugar Inicio 2do relevo":	            {prop: 'lugInicio3', type: String},
            "Inicio 2do relevo":	                {prop: 'hrInicio3',  type: (val) => ajustarHora(val)},

            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugInicio3', type: String},
            "Inicio 2do relevo __sabado__":	        {prop: 's_hrInicio3',  type: (val) => ajustarHora(val)},

            "Lugar Inicio 2do relevo __domingo__":	{prop: 'd_lugInicio3', type: String},
            "Inicio 2do relevo __domingo__":	    {prop: 'd_hrInicio3',  type: (val) => ajustarHora(val)},
    }},
    'Termino': { 
        prop: 'termino',
        type: {

            "Hora" : {prop: 'horaTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC" : {prop: 'lugTerCC', type: String },
            "Termino en Modulo":	{prop: 'hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno": {prop: 'hrTerT', type: (val) => ajustarHora(val)},	

            "Hora __sabado__" : {prop: 's_horaTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __sabado__" : {prop: 's_lugTerCC', type: String },
            "Termino en Modulo __sabado__" : {prop: 's_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __sabado__" : {prop: 's_hrTerT', type: (val) => ajustarHora(val)},	

            "Hora __domingo__" : {prop: 'd_horaTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __domingo__" : {prop: 'd_lugTerCC', type: String },
            "Termino en Modulo __domingo__":	{prop: 'd_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __domingo__": {prop: 'd_hrTerT', type: (val) => ajustarHora(val)},	
    }},
}


export const propuesta22 = {
    "No": { prop: 'servicio', type: String, required: true },
    'Economico': { prop: 'economico', type: String },
    'No de credenciales': {         // No es necesario que coincida con lo de excel, solo es para tener agrupado lo de debajo
        prop: 'credenciales',
        type: {           // Se agrupará dentro de 'credenciales' y solo puedetener una propiedad
            '1er Turno': {prop: 'turno1cred', type: String},
            'Relevo': {prop: 'turno2cred', type: String},
            '2do relevo': {prop: 'turno3cred', type: String}
        } 
    },
    'Sistema': { prop: 'sistema', type: String },
    'Descansos': {
        prop: 'descansos', 
        type: {
            'L': {prop: 'lunes', type: String},
            'M': {prop: 'martes', type: String},
            'Mi': {prop: 'miercoles', type: String},
            'J': {prop: 'jueves', type: String},
            'V': {prop: 'viernes', type: String},
            'S': {prop: 'sabado', type: String},
            'D': {prop: 'domingo', type: String},
    }},
    'Primer turno': { 
        prop: 'turno1',
        type: {
            '1er Turno': {prop: 'cred1', type: String},

            'Hora inicio 1er Turno':            {prop: 'hrInicio1', type: (val) => ajustarHora(val) },	
            'Hora inicio CC':                   {prop: 'hrInicioCC', type: (val) => ajustarHora(val) },
            'Lugar Inicio':	                    {prop: 'lugInicio1', type: String},
            'Hora termino':                     {prop: 'hrTermino1', type: (val) => ajustarHora(val)},	
            'Lugar Inicio relevo':              {prop: 'lugTermino1', type: String},
            
            'Hora inicio 1er Turno __sabado__': {prop: 's_hrInicio1', type: (val) => ajustarHora(val) }, 	
            'Hora inicio CC __sabado__':        {prop: 's_hrInicioCC', type: (val) => ajustarHora(val) },  	
            'Lugar Inicio __sabado__':          {prop: 's_lugInicio1', type: String }, 
            'Hora termino __sabado__':          {prop: 's_hrTermino1', type: (val) => ajustarHora(val) }, 	
            'Lugar Inicio relevo __sabado__':   {prop: 's_lugTermino1', type: String},
            
            'Hora inicio 1er Turno __domingo__':{prop: 'd_hrInicio1', type: (val) => ajustarHora(val) }, 	
            'Hora inicio CC __domingo__':       {prop: 'd_hrInicioCC', type: (val) => ajustarHora(val) },  	
            'Lugar Inicio __domingo__':         {prop: 'd_lugInicio1', type: String }, 
            'Hora termino __domingo__':         {prop: 'd_hrTermino1', type: (val) => ajustarHora(val) }, 
            'Lugar Inicio relevo __domingo__':  {prop: 'd_lugTermino1', type: String},
    }},
    'Segundo turno': { 
        prop: 'turno2',
        type: {
            'Relevo': {prop: 'cred2', type: String},

            "Lugar Inicio relevo":	                {prop: 'lugInicio2', type: String},
            "Hora inicio relevo":                   {prop: 'hrInicio2', type: (val) => ajustarHora(val) },
            "Lugar Inicio 2do relevo":	            {prop: 'lugTermino2', type: String},
            "Hora termino relevo":                  {prop: 'hrTermino2', type: (val) => ajustarHora(val)},	
            
            
            'Lugar Inicio relevo __sabado__':       {prop: 's_lugInicio2', type: String }, 
            "Hora inicio relevo __sabado__":        {prop: 's_hrInicio2', type: (val) => ajustarHora(val) },
            'Hora termino relevo __sabado__':       {prop: 's_hrTermino2', type: (val) => ajustarHora(val) }, 	
            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugTermino2', type: String},
            
            'Lugar Inicio relevo __domingo__':       {prop: 'd_lugInicio2', type: String }, 
            "Hora inicio relevo __domingo__":        {prop: 'd_hrInicio2', type: (val) => ajustarHora(val) },
            'Hora termino relevo __domingo__':       {prop: 'd_hrTermino2', type: (val) => ajustarHora(val) }, 	
            "Lugar Inicio 2do relevo __domingo__":   {prop: 'd_lugTermino2', type: String},
    }},
    'Tercer turno': { 
        prop: 'turno3',
        type: {
            '2do relevo': {prop: 'cred3', type: String},

            "Lugar Inicio 2do relevo":	            {prop: 'lugInicio3', type: String},
            "Inicio 2do relevo":	                {prop: 'hrInicio3',  type: (val) => ajustarHora(val)},

            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugInicio3', type: String},
            "Inicio 2do relevo __sabado__":	        {prop: 's_hrInicio3',  type: (val) => ajustarHora(val)},

            "Lugar Inicio 2do relevo __domingo__":	{prop: 'd_lugInicio3', type: String},
            "Inicio 2do relevo __domingo__":	    {prop: 'd_hrInicio3',  type: (val) => ajustarHora(val)},
    }},
    'Termino': { 
        prop: 'termino',
        type: {

            "Hora" : {prop: 'hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC" : {prop: 'lugTerCC', type: String },
            "Termino en Modulo":	{prop: 'hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno": {prop: 'hrTerT', type: (val) => ajustarHora(val)},	

            "Hora __sabado__" : {prop: 's_hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __sabado__" : {prop: 's_lugTerCC', type: String },
            "Termino en Modulo __sabado__" : {prop: 's_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __sabado__" : {prop: 's_hrTerT', type: (val) => ajustarHora(val)},	

            "Hora __domingo__" : {prop: 'd_hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __domingo__" : {prop: 'd_lugTerCC', type: String },
            "Termino en Modulo __domingo__":	{prop: 'd_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __domingo__": {prop: 'd_hrTerT', type: (val) => ajustarHora(val)},	
    }},
}

export const propuesta23 = {
    "No": { prop: 'servicio', type: String, required: true },
    'Economico': { prop: 'economico', type: String },
    'No de credenciales': {         // No es necesario que coincida con lo de excel, solo es para tener agrupado lo de debajo
        prop: 'credenciales',
        type: {           // Se agrupará dentro de 'credenciales' y solo puedetener una propiedad
            '1er Turno': {prop: 'turno1cred', type: String},
            'Relevo': {prop: 'turno2cred', type: String},
            '2do relevo': {prop: 'turno3cred', type: String}
        } 
    },
    'Sistema': { prop: 'sistema', type: String },
    'Descansos': {
        prop: 'descansos', 
        type: {
            'L': {prop: 'lunes', type: String},
            'M': {prop: 'martes', type: String},
            'Mi': {prop: 'miercoles', type: String},
            'J': {prop: 'jueves', type: String},
            'V': {prop: 'viernes', type: String},
            'S': {prop: 'sabado', type: String},
            'D': {prop: 'domingo', type: String},
    }},
    'Primer turno': { 
        prop: 'turno1',
        type: {
            '1er Turno': {prop: 'cred1', type: String},

            'Hora inicio 1er Turno':            {prop: 'hrInicio1', type: (val) => ajustarHora(val) },	
            'Hora inicio CC':                   {prop: 'hrInicioCC', type: (val) => ajustarHora(val) },
            'Lugar Inicio':	                    {prop: 'lugInicio1', type: String},
            'Hora termino':                     {prop: 'hrTermino1', type: (val) => ajustarHora(val)},	
            'Lugar Inicio relevo':              {prop: 'lugTermino1', type: String},
            
            'Hora inicio 1er Turno __sabado__': {prop: 's_hrInicio1', type: (val) => ajustarHora(val) }, 	
            'Hora inicio CC __sabado__':        {prop: 's_hrInicioCC', type: (val) => ajustarHora(val) },  	
            'Lugar Inicio __sabado__':          {prop: 's_lugInicio1', type: String }, 
            'Hora termino __sabado__':          {prop: 's_hrTermino1', type: (val) => ajustarHora(val) }, 	
            'Lugar Inicio relevo __sabado__':   {prop: 's_lugTermino1', type: String},
            
            'Hora inicio 1er Turno __domingo__':{prop: 'd_hrInicio1', type: (val) => ajustarHora(val) }, 	
            'Hora inicio CC __domingo__':       {prop: 'd_hrInicioCC', type: (val) => ajustarHora(val) },  	
            'Lugar Inicio __domingo__':         {prop: 'd_lugInicio1', type: String }, 
            'Hora termino __domingo__':         {prop: 'd_hrTermino1', type: (val) => ajustarHora(val) }, 
            'Lugar Inicio relevo __domingo__':  {prop: 'd_lugTermino1', type: String},
    }},
    'Segundo turno': { 
        prop: 'turno2',
        type: {
            'Relevo': {prop: 'cred2', type: String},

            "Lugar Inicio relevo":	                {prop: 'lugInicio2', type: String},
            "Hora inicio relevo":                   {prop: 'hrInicio2', type: (val) => ajustarHora(val) },
            "Lugar Inicio 2do relevo":	            {prop: 'lugTermino2', type: String},
            "Hora termino relevo":                  {prop: 'hrTermino2', type: (val) => ajustarHora(val)},	
            
            
            'Lugar Inicio relevo __sabado__':       {prop: 's_lugInicio2', type: String }, 
            "Hora inicio relevo __sabado__":        {prop: 's_hrInicio2', type: (val) => ajustarHora(val) },
            'Hora termino relevo __sabado__':       {prop: 's_hrTermino2', type: (val) => ajustarHora(val) }, 	
            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugTermino2', type: String},
            
            'Lugar Inicio relevo __domingo__':       {prop: 'd_lugInicio2', type: String }, 
            "Hora inicio relevo __domingo__":        {prop: 'd_hrInicio2', type: (val) => ajustarHora(val) },
            'Hora termino relevo __domingo__':       {prop: 'd_hrTermino2', type: (val) => ajustarHora(val) }, 	
            "Lugar Inicio 2do relevo __domingo__":   {prop: 'd_lugTermino2', type: String},
    }},
    'Tercer turno': { 
        prop: 'turno3',
        type: {
            '2do relevo': {prop: 'cred3', type: String},

            "Lugar Inicio 2do relevo":	            {prop: 'lugInicio3', type: String},
            "Inicio 2do relevo":	                {prop: 'hrInicio3',  type: (val) => ajustarHora(val)},

            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugInicio3', type: String},
            "Inicio 2do relevo __sabado__":	        {prop: 's_hrInicio3',  type: (val) => ajustarHora(val)},

            "Lugar Inicio 2do relevo __domingo__":	{prop: 'd_lugInicio3', type: String},
            "Inicio 2do relevo __domingo__":	    {prop: 'd_hrInicio3',  type: (val) => ajustarHora(val)},
    }},
    'Termino': { 
        prop: 'termino',
        type: {

            "Hora" : {prop: 'hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC" : {prop: 'lugTerCC', type: String },
            "Termino en Modulo":	{prop: 'hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno": {prop: 'hrTerT', type: (val) => ajustarHora(val)},	

            "Hora __sabado__" : {prop: 's_hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __sabado__" : {prop: 's_lugTerCC', type: String },
            "Termino en Modulo __sabado__" : {prop: 's_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __sabado__" : {prop: 's_hrTerT', type: (val) => ajustarHora(val)},	

            "Hora __domingo__" : {prop: 'd_hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __domingo__" : {prop: 'd_lugTerCC', type: String },
            "Termino en Modulo __domingo__":	{prop: 'd_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __domingo__": {prop: 'd_hrTerT', type: (val) => ajustarHora(val)},	
    }},
}

// Rol v4 | v3_2
export const propuesta24 = {
    "No": { prop: 'servicio', type: String, required: true },
    'Económico': { prop: 'economico', type: String },
    'No de credenciales': {         // No es necesario que coincida con lo de excel, solo es para tener agrupado lo de debajo
        prop: 'credenciales',
        type: {           // Se agrupará dentro de 'credenciales' y solo puedetener una propiedad
            '1er Turno': {prop: 'turno1cred', type: String},
            'Relevo': {prop: 'turno2cred', type: String},
            '2do relevo': {prop: 'turno3cred', type: String}
        } 
    },
    'Sistema': { prop: 'sistema', type: String },
    'Descansos': {
        prop: 'descansos', 
        type: {
            'L': {prop: 'lunes', type: String},
            'M': {prop: 'martes', type: String},
            'Mi': {prop: 'miercoles', type: String},
            'J': {prop: 'jueves', type: String},
            'V': {prop: 'viernes', type: String},
            'S': {prop: 'sabado', type: String},
            'D': {prop: 'domingo', type: String},
    }},
    'Primer turno': { 
        prop: 'turno1',
        type: {
            '1er Turno': {prop: 'cred1', type: String},

            'Hora inicio 1er Turno':            {prop: 'hrInicio1', type: (val) => (!!val) ? ajustarHora(val) : null },	
            'Hora inicio CC':                   {prop: 'hrInicioCC', type: (val) => (!!val) ? ajustarHora(val) : null },
            'Lugar Inicio':	                    {prop: 'lugInicio1', type: String},
            'Hora termino':                     {prop: 'hrTermino1', type: (val) => (!!val) ? ajustarHora(val) : null},	
            'Lugar Inicio relevo':              {prop: 'lugTermino1', type: String},
            
            'Hora inicio 1er Turno __sabado__': {prop: 's_hrInicio1', type: (val) => (!!val) ? ajustarHora(val) : null }, 	
            'Hora inicio CC __sabado__':        {prop: 's_hrInicioCC', type: (val) => (!!val) ? ajustarHora(val) : null },  	
            'Lugar Inicio __sabado__':          {prop: 's_lugInicio1', type: String }, 
            'Hora termino __sabado__':          {prop: 's_hrTermino1', type: (val) => (!!val) ? ajustarHora(val) : null }, 	
            'Lugar Inicio relevo __sabado__':   {prop: 's_lugTermino1', type: String},
            
            'Hora inicio 1er Turno __domingo__':{prop: 'd_hrInicio1', type: (val) => (!!val) ? ajustarHora(val) : null }, 	
            'Hora inicio CC __domingo__':       {prop: 'd_hrInicioCC', type: (val) => (!!val) ? ajustarHora(val) : null },  	
            'Lugar Inicio __domingo__':         {prop: 'd_lugInicio1', type: String }, 
            'Hora termino __domingo__':         {prop: 'd_hrTermino1', type: (val) => (!!val) ? ajustarHora(val) : null }, 
            'Lugar Inicio relevo __domingo__':  {prop: 'd_lugTermino1', type: String},
    }},
    'Segundo turno': { 
        prop: 'turno2',
        type: {
            'Relevo': {prop: 'cred2', type: String},

            "Lugar Inicio relevo":	                {prop: 'lugInicio2', type: String},
            "Hora inicio relevo":                   {prop: 'hrInicio2', type: (val) => (!!val) ? ajustarHora(val) : null },
            "Lugar Inicio 2do relevo":	            {prop: 'lugTermino2', type: String},
            "Hora termino relevo":                  {prop: 'hrTermino2', type: (val) => (!!val) ? ajustarHora(val) : null},	
            
            
            'Lugar Inicio relevo __sabado__':       {prop: 's_lugInicio2', type: String }, 
            "Hora inicio relevo __sabado__":        {prop: 's_hrInicio2', type: (val) => (!!val) ? ajustarHora(val) : null },
            'Hora termino relevo __sabado__':       {prop: 's_hrTermino2', type: (val) => (!!val) ? ajustarHora(val) : null }, 	
            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugTermino2', type: String},
            
            'Lugar Inicio relevo __domingo__':       {prop: 'd_lugInicio2', type: String }, 
            "Hora inicio relevo __domingo__":        {prop: 'd_hrInicio2', type: (val) => (!!val) ? ajustarHora(val) : null },
            'Hora termino relevo __domingo__':       {prop: 'd_hrTermino2', type: (val) => (!!val) ? ajustarHora(val) : null }, 	
            "Lugar Inicio 2do relevo __domingo__":   {prop: 'd_lugTermino2', type: String},
    }},
    'Tercer turno': { 
        prop: 'turno3',
        type: {
            '2do relevo': {prop: 'cred3', type: String},

            "Lugar Inicio 2do relevo":	            {prop: 'lugInicio3', type: String},
            "Hora Inicio 2do relevo":	            {prop: 'hrInicio3',  type: (val) => (!!val) ? ajustarHora(val) : null},

            "Lugar Inicio 2do relevo __sabado__":   {prop: 's_lugInicio3', type: String},
            "Hora Inicio 2do relevo __sabado__":	{prop: 's_hrInicio3',  type: (val) => (!!val) ? ajustarHora(val) : null},

            "Lugar Inicio 2do relevo __domingo__":	{prop: 'd_lugInicio3', type: String},
            "Hora Inicio 2do relevo __domingo__":	{prop: 'd_hrInicio3',  type: (val) => (!!val) ? ajustarHora(val) : null},
    }},
    'Termino': { 
        prop: 'termino',
        type: {

            "Hora Termino en CC" :              {prop: 'hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC" :                        {prop: 'lugTerCC', type: String },
            "Termino en Modulo":	            {prop: 'hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno":                {prop: 'hrTerT', type: (val) => ajustarHora(val)},	

            "Hora Termino en CC __sabado__" :   {prop: 's_hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __sabado__" :             {prop: 's_lugTerCC', type: String },
            "Termino en Modulo __sabado__" :    {prop: 's_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __sabado__" :    {prop: 's_hrTerT', type: (val) => ajustarHora(val)},	

            "Hora Termino en CC __domingo__" :  {prop: 'd_hrTerCC', type: (val) => ajustarHora(val) },	
            "Lugar CC __domingo__" :            {prop: 'd_lugTerCC', type: String },
            "Termino en Modulo __domingo__":	{prop: 'd_hrTerMod', type: (val) => ajustarHora(val)},
            "Termino del turno __domingo__":    {prop: 'd_hrTerT', type: (val) => ajustarHora(val)},	
    }},
}



//* ---------- -------------------- -------------------- -------------------- ----------
export const propuesta51 = {
    'no': { prop: 'servicio', type: String, required: true },
    'economico': { prop: 'eco', type: String },
    'sistema': { prop: 'sistema', type: Number|String },
    'no de credenciales': {         // No es necesario que coincida con lo de excel, solo es para tener agrupado lo de debajo
        prop: 'credenciales',
        type: {           // Se agrupará dentro de 'credenciales' y solo puedetener una propiedad
            '1er turno': {prop: 'cred_turno1' },
            '2do turno': {prop: 'cred_turno2' },
            '3er turno': {prop: 'cred_turno3' }
        } 
    },
    'Descansos': {
        prop: 'descansos', 
        type: {
            'l': {prop: 'lunes', type: String},
            'm': {prop: 'martes', type: String},
            'mi': {prop: 'miercoles', type: String},
            'j': {prop: 'jueves', type: String},
            'v': {prop: 'viernes', type: String},
            's': {prop: 'sabado', type: String},
            'd': {prop: 'domingo', type: String},
    }},
    'Lun a Vie': { 
        prop: 'lun_vie',
        type: {
            'hora inicio turno 1':            {prop: 'hrIni1', type: (val) => (!!val) ? ajustarHora(val) : null },	
            'hora inicio en cc':              {prop: 'hrIniCC', type: (val) => (!!val) ? ajustarHora(val) : null },
            'lugar inicio 1':	              {prop: 'lugIni1', type: String},
            'hora termino turno 1':           {prop: 'hrTer1', type: (val) => (!!val) ? ajustarHora(val) : null},	
            // // 'Lugar Inicio 2':                 {prop: 'lugTermino1', type: String},
        
            "lugar inicio 2":	              {prop: 'lugIni2', type: String},
            "hora inicio 2":                  {prop: 'hrIni2', type: (val) => (!!val) ? ajustarHora(val) : null },
            "hora termino turno 2":           {prop: 'hrTer2', type: (val) => (!!val) ? ajustarHora(val) : null},	
            // // "lugar Inicio 3":	              {prop: 'lugTermino2', type: String},
            
            "lugar inicio 3":	              {prop: 'lugIni3', type: String},
            "hora inicio turno 3":	          {prop: 'hrIni3',  type: (val) => (!!val) ? ajustarHora(val) : null },

            "hora termino en cc" :            {prop: 'hrTerCC', type: (val) => ajustarHora(val) },	
            "lugar de termino cc":            {prop: 'lugTerCC', type: String },
            "termino en modulo":	          {prop: 'hrTerMod', type: (val) => ajustarHora(val)},
            "termino del turno":              {prop: 'hrTerT', type: (val) => ajustarHora(val)},	

        }
    },
    'Sabado': { 
        prop: 'sab',
        type: {
            "hora inicio turno 1 __s__":            {prop: 'hrIni1', type: (val) => (!!val) ? ajustarHora(val) : null },	
            "hora inicio cc 1 __s__":               {prop: 'hrIniCC', type: (val) => (!!val) ? ajustarHora(val) : null },
            "lugar inicio 1 __s__":	                {prop: 'lugIni1', type: String},
            "hora termino turno 1 __s__":           {prop: 'hrTer1', type: (val) => (!!val) ? ajustarHora(val) : null},	
            // // 'lugar inicio 2':                 {prop: 'lugTermino1', type: String},
        
            "lugar inicio 2 __s__":	                {prop: 'lugIni2', type: String},
            "hora inicio 2 __s__":                  {prop: 'hrIni2', type: (val) => (!!val) ? ajustarHora(val) : null },
            "hora termino turno 2 __s__":           {prop: 'hrTer2', type: (val) => (!!val) ? ajustarHora(val) : null},	
            // // "lugar inicio 3 __s__":	              {prop: 'lugTermino2', type: String},
            
            "lugar inicio 3 __s__":	                {prop: 'lugIni3', type: String},
            "hora inicio turno 3 __s__":	        {prop: 'hrIni3',  type: (val) => (!!val) ? ajustarHora(val) : null},

            "hora termino en cc __s__":             {prop: 'hrTerCC', type: (val) => ajustarHora(val) },	
            "lugar de termino cc __s__":            {prop: 'lugTerCC', type: String },
            "termino en modulo __s__":	            {prop: 'hrTerMod', type: (val) => ajustarHora(val)},
            "termino del turno __s__":              {prop: 'hrTerT', type: (val) => ajustarHora(val)},	

        }
    },
    'Domingo': { 
        prop: 'dom',
        type: {
            "hora inicio turno 1 __d__":            {prop: 'hrIni1', type: (val) => (!!val) ? ajustarHora(val) : null },	
            "hora inicio cc 1 __d__":               {prop: 'hrIniCC', type: (val) => (!!val) ? ajustarHora(val) : null },
            "lugar inicio 1 __d__":	                {prop: 'lugIni1', type: String},
            "hora termino turno 1 __d__":           {prop: 'hrTer1', type: (val) => (!!val) ? ajustarHora(val) : null},	
            // // 'lugar inicio 2':                 {prop: 'lugTermino1', type: String},
        
            "lugar inicio 2 __d__":	                {prop: 'lugIni2', type: String},
            "hora inicio 2 __d__":                  {prop: 'hrIni2', type: (val) => (!!val) ? ajustarHora(val) : null },
            "hora termino turno 2 __d__":           {prop: 'hrTer2', type: (val) => (!!val) ? ajustarHora(val) : null},	
            // // "lugar inicio 3 __d__":	              {prop: 'lugTermino2', type: String},
            
            "lugar inicio 3 __d__":	                {prop: 'lugIni3', type: String},
            "hora inicio turno 3 __d__":	        {prop: 'hrIni3',  type: (val) => (!!val) ? ajustarHora(val) : null},

            "hora termino en cc __d__":             {prop: 'hrTerCC', type: (val) => ajustarHora(val) },	
            "lugar de termino cc __d__":            {prop: 'lugTerCC', type: String },
            "termino en modulo __d__":	            {prop: 'hrTerMod', type: (val) => ajustarHora(val)},
            "termino del turno __d__":              {prop: 'hrTerT', type: (val) => ajustarHora(val)},	

        }
    },
}

export const myColsNames = [
    'no', 'economico', 'sistema', '1er turno', '2do turno', '3er turno', 'l', 'm', 'mi', 'j', 'v', 's', 'd',
             
    'hora inicio turno 1', 'hora inicio en cc', 'lugar inicio 1', 'hora termino turno 1',
    'lugar inicio 2', 'hora inicio 2', 'hora termino turno 2', 'lugar inicio 3', 'hora inicio turno 3',
    'hora termino en cc', 'lugar de termino cc', 'termino en modulo', 'termino del turno',

    'hora inicio turno 1 __s__', 'hora inicio cc 1 __s__', 'lugar inicio 1 __s__', 'hora termino turno 1 __s__',
    'lugar inicio 2 __s__', 'hora inicio 2 __s__', 'hora termino turno 2 __s__', 'lugar inicio 3 __s__', 'hora inicio turno 3 __s__',
    'hora termino en cc __s__', 'lugar de termino cc __s__', 'termino en modulo __s__', 'termino del turno __s__',

    'hora inicio turno 1 __d__', 'hora inicio cc 1 __d__', 'lugar inicio 1 __d__', 'hora termino turno 1 __d__',
    'lugar inicio 2 __d__', 'hora inicio 2 __d__', 'hora termino turno 2 __d__', 'lugar inicio 3 __d__', 'hora inicio turno 3 __d__',
    'hora termino en cc __d__', 'lugar de termino cc __d__', 'termino en modulo __d__', 'termino del turno __d__',
]
import Database from 'better-sqlite3'
//fs Files Systen manejos de archivos y carpetas
import fs from 'node:fs'
import {config} from '../config/env.js'

//recursive:true crea carpetas intermedias y que falten , y no da error si ya estan
fs.mkdirSync(config.carpetaDatos, {recursive:true})
fs.mkdirSync(config.carpetaFirmas, {recursive:true})
fs.mkdirSync(config.carpetaRespaldos, {recursive:true})


//Abrir base de datos
export const db= new Database(config.archivoBaseDatos)

//Pemitir escrituras dos desde otro dispitivos 
db.pragma('journal_mode = WAL')

//Hace respetar las relaciones de la tabla
db.pragma('foreign_keys = ON')
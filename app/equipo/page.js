'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const C = {
  teal:      '#007a8a',
  tealLight: '#10cfc9',
  tealXL:    '#e8f7f8',
  gray50:    '#f8fafb',
  gray100:   '#eff3f4',
  gray300:   '#c8d6d9',
  gray500:   '#7a9199',
  dark:      '#1a2f35',
  amber:     '#f5a623',
}

const DIAS_LABEL = ['D','L','M','M','J','V','S']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Reservas hardcoded hasta conectar tabla reservas en Supabase
const RESERVAS = [
  { id:1, nombre:'Andrea Bourasseau', hora:'14:00', fecha:'Sáb 30 may.', pax:20, tel:'56934990617', mes:4, diaNum:30, nota:'Zona jardín' },
  { id:2, nombre:'Gabriela Rico',     hora:'15:30', fecha:'Sáb 30 may.', pax:8,  tel:'56996153673', mes:4, diaNum:30, nota:'' },
  { id:3, nombre:'Maya Jara Arce',    hora:'10:00', fecha:'Dom 31 may.', pax:10, tel:'56982494648', mes:4, diaNum:31, nota:'Cumpleaños' },
  { id:4, nombre:'Loreto Tapia',      hora:'10:30', fecha:'Dom 21 jun.', pax:13, tel:'56991293248', mes:5, diaNum:21, nota:'' },
  { id:5, nombre:'Camila Arroyo',     hora:'15:30', fecha:'Sáb 27 jun.', pax:12, tel:'56974546355', mes:5, diaNum:27, nota:'Zona interior' },
]

const RESERVA_MAP = {}
RESERVAS.forEach(r => {
  const key = `${r.mes}-${r.diaNum}`
  if (!RESERVA_MAP[key]) RESERVA_MAP[key] = []
  RESERVA_MAP[key].push(r)
})

export default function Equipo() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const diasPrev  = new Date(anio, mes, 0).getDate()

  const celdas = []
  for (let i = primerDia - 1; i >= 0; i--) celdas.push({ dia: diasPrev - i, esMes: false })
  for (let i = 1; i <= diasEnMes; i++)      celdas.push({ dia: i, esMes: true })
  let sig = 1
  while (celdas.length % 7 !== 0) celdas.push({ dia: sig++, esMes: false })

  const getReservas = (dia, esMes) => (!esMes ? [] : (RESERVA_MAP[`${mes}-${dia}`] || []))
  const esHoy = (dia, esMes) => esMes && dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()

  const prevMes = () => { if(mes===0){setMes(11);setAnio(a=>a-1)}else setMes(m=>m-1); setDiaSeleccionado(null) }
  const nextMes = () => { if(mes===11){setMes(0);setAnio(a=>a+1)}else setMes(m=>m+1); setDiaSeleccionado(null) }

  const reservasDelDia = diaSeleccionado ? getReservas(diaSeleccionado, true) : []
  const totalPax = RESERVAS.reduce((s,r)=>s+r.pax,0)

  return (
    <div style={{minHeight:'100vh',background:C.gray50}}>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg, ${C.teal} 0%, #005f6e 100%)`,padding:'28px 20px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <div style={{width:48,height:48,borderRadius:14,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>🏠</div>
          <div>
            <div style={{fontFamily:'Nunito',fontSize:20,fontWeight:900,color:'white',letterSpacing:'0.5px'}}>CASA TURQUESA</div>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.6)',letterSpacing:'2px',textTransform:'uppercase'}}>Calendario del equipo</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[[`${RESERVAS.length}`,'reservas próximas'],[`${totalPax}`,'pax en total']].map(([v,l])=>(
            <div key={l} style={{flex:1,background:'rgba(255,255,255,0.12)',borderRadius:12,padding:'10px 14px',border:'1px solid rgba(255,255,255,0.15)'}}>
              <div style={{fontFamily:'Nunito',fontSize:22,fontWeight:900,color:'white'}}>{v}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.65)',marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'16px 16px 40px'}}>

        {/* Calendario */}
        <div style={{background:'white',borderRadius:18,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontFamily:'Nunito',fontSize:17,fontWeight:900,color:C.dark}}>{MESES[mes]} {anio}</div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={prevMes} style={{width:32,height:32,background:C.tealXL,border:'none',borderRadius:8,cursor:'pointer',color:C.teal,fontSize:16}}>‹</button>
              <button onClick={nextMes} style={{width:32,height:32,background:C.tealXL,border:'none',borderRadius:8,cursor:'pointer',color:C.teal,fontSize:16}}>›</button>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
            {DIAS_LABEL.map(d=>(
              <div key={d} style={{textAlign:'center',fontSize:10,fontWeight:800,color:C.gray500,padding:'4px 0 6px',textTransform:'uppercase'}}>{d}</div>
            ))}
            {celdas.map((c,i) => {
              const res = getReservas(c.dia, c.esMes)
              const hoyF = esHoy(c.dia, c.esMes)
              const selected = diaSeleccionado === c.dia && c.esMes
              return (
                <div key={i}
                  onClick={()=>{ if(c.esMes && res.length>0) setDiaSeleccionado(selected?null:c.dia) }}
                  style={{
                    aspectRatio:'1',display:'flex',flexDirection:'column',
                    alignItems:'center',justifyContent:'center',
                    borderRadius:10,gap:3,
                    cursor:res.length>0&&c.esMes?'pointer':'default',
                    background:selected?C.teal:hoyF?C.tealLight:res.length>0&&c.esMes?C.tealXL:'transparent',
                    border:selected?`2px solid ${C.teal}`:'2px solid transparent',
                  }}
                >
                  <span style={{fontFamily:'Nunito',fontSize:13,fontWeight:hoyF||res.length>0?900:600,
                    color:selected?'white':hoyF?C.teal:!c.esMes?C.gray300:C.dark,lineHeight:1}}>
                    {c.dia}
                  </span>
                  {res.length>0&&c.esMes&&(
                    <div style={{display:'flex',gap:2}}>
                      {Array(Math.min(res.length,3)).fill(0).map((_,j)=>(
                        <div key={j} style={{width:4,height:4,borderRadius:'50%',background:selected?'rgba(255,255,255,0.8)':C.tealLight}} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{display:'flex',gap:16,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.gray100}`,flexWrap:'wrap'}}>
            {[[C.tealXL,'Con reserva — toca para ver'],[C.tealLight,'Hoy']].map(([bg,label])=>(
              <div key={label} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:C.gray500,fontWeight:700}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:bg,border:`1.5px solid ${C.tealLight}`}} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Detalle día seleccionado */}
        {diaSeleccionado && reservasDelDia.length > 0 && (
          <div style={{background:'white',borderRadius:18,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',overflow:'hidden',marginBottom:14}}>
            <div style={{background:`linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontFamily:'Nunito',fontSize:16,fontWeight:900,color:'white'}}>{diaSeleccionado} de {MESES[mes]}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.75)',marginTop:2}}>{reservasDelDia.length} {reservasDelDia.length===1?'reserva':'reservas'} · {reservasDelDia.reduce((s,r)=>s+r.pax,0)} pax</div>
              </div>
              <button onClick={()=>setDiaSeleccionado(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:8,width:32,height:32,color:'white',fontSize:18,cursor:'pointer'}}>×</button>
            </div>
            {reservasDelDia.map((r,i)=>(
              <div key={r.id} style={{padding:'14px 16px',borderBottom:i<reservasDelDia.length-1?`1px solid ${C.gray100}`:'none'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                  <div style={{minWidth:54,textAlign:'center',background:C.tealXL,borderRadius:10,padding:'8px 6px',flexShrink:0}}>
                    <div style={{fontFamily:'Nunito',fontSize:16,fontWeight:900,color:C.teal,lineHeight:1}}>{r.hora}</div>
                    <div style={{fontSize:9,color:C.gray500,marginTop:3,fontWeight:700,textTransform:'uppercase'}}>hrs</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:'Nunito',fontSize:15,fontWeight:800,color:C.dark}}>{r.nombre}</div>
                    <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
                      <span style={{background:C.tealXL,color:C.teal,fontSize:12,fontWeight:800,padding:'4px 10px',borderRadius:20,fontFamily:'Nunito'}}>👥 {r.pax} personas</span>
                      {r.nota&&<span style={{background:'#fef3e2',color:'#b7770d',fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:20}}>📌 {r.nota}</span>}
                    </div>
                    <a href={`https://wa.me/${r.tel}`} target="_blank" rel="noreferrer"
                      style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:10,textDecoration:'none',background:'#25d366',color:'white',borderRadius:10,padding:'7px 14px',fontSize:12,fontWeight:800,fontFamily:'Nunito'}}>
                      💬 Contactar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista completa */}
        <div style={{background:'white',borderRadius:18,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${C.gray100}`}}>
            <div style={{fontFamily:'Nunito',fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:'1.2px',textTransform:'uppercase'}}>Todas las reservas próximas</div>
          </div>
          {RESERVAS.map((r,i)=>(
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<RESERVAS.length-1?`1px solid ${C.gray100}`:'none'}}>
              <div style={{minWidth:44,textAlign:'center',background:C.tealXL,borderRadius:10,padding:'6px 4px',flexShrink:0}}>
                <div style={{fontFamily:'Nunito',fontSize:15,fontWeight:900,color:C.teal,lineHeight:1}}>{r.diaNum}</div>
                <div style={{fontSize:9,color:C.gray500,marginTop:2,fontWeight:700,textTransform:'uppercase'}}>{MESES[r.mes].slice(0,3)}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:'Nunito',fontSize:13,fontWeight:800,color:C.dark,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.nombre}</div>
                <div style={{fontSize:11,color:C.gray500,marginTop:2}}>{r.hora} · {r.pax} pax{r.nota?` · ${r.nota}`:''}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontFamily:'Nunito',fontSize:18,fontWeight:900,color:C.teal}}>{r.pax}</div>
                <div style={{fontSize:9,color:C.gray500,textTransform:'uppercase',letterSpacing:'0.5px'}}>pax</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',marginTop:24,fontSize:11,color:C.gray300,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase'}}>
          Casa Turquesa · Solo uso interno del equipo
        </div>
      </div>
    </div>
  )
}

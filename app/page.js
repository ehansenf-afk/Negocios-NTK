'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  teal:      '#007a8a',
  tealLight: '#10cfc9',
  tealXL:    '#e8f7f8',
  white:     '#ffffff',
  gray50:    '#f8fafb',
  gray100:   '#eff3f4',
  gray300:   '#c8d6d9',
  gray500:   '#7a9199',
  gray700:   '#3d5560',
  dark:      '#1a2f35',
  red:       '#e05252',
  amber:     '#f5a623',
  green:     '#2ecc71',
  sidebar:   '#0d2b32',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────
function initials(name) {
  return (name || '').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
}
function formatMonto(n) {
  return '$' + Number(n).toLocaleString('es-CL')
}

// ─── RESERVAS (hardcoded por ahora, hasta conectar WSF) ───────────────────
const RESERVAS_MOCK = [
  { id:1, nombre:'Andrea Bourasseau', hora:'14:00', fecha:'Sáb 30 may.', pax:20, tel:'56934990617', mes:4, diaNum:30 },
  { id:2, nombre:'Gabriela Rico',     hora:'15:30', fecha:'Sáb 30 may.', pax:8,  tel:'56996153673', mes:4, diaNum:30 },
  { id:3, nombre:'Maya Jara Arce',    hora:'10:00', fecha:'Dom 31 may.', pax:10, tel:'56982494648', mes:4, diaNum:31 },
  { id:4, nombre:'Loreto Tapia',      hora:'10:30', fecha:'Dom 21 jun.', pax:13, tel:'56991293248', mes:5, diaNum:21 },
  { id:5, nombre:'Camila Arroyo',     hora:'15:30', fecha:'Sáb 27 jun.', pax:12, tel:'56974546355', mes:5, diaNum:27 },
]

const RESERVA_MAP = {}
RESERVAS_MOCK.forEach(r => {
  const key = `${r.mes}-${r.diaNum}`
  if (!RESERVA_MAP[key]) RESERVA_MAP[key] = []
  RESERVA_MAP[key].push(r)
})

const CONVERSACIONES = [
  { nombre:'Carolina Del Pilar Cerna', preview:'¡Hola! Soy Martina, la asistente...', hora:'07:29' },
  { nombre:'Cristián Rojas Vallés',    preview:'¡Te va a encantar esta parte! 🙌', hora:'07:03' },
  { nombre:'Una María José 🌱',        preview:'Para 20 a 30 personas la zona...', hora:'01:23' },
  { nombre:'Jael Sibomey Lizama',      preview:'¡Hola! Soy Martina, la asistente...', hora:'12:55' },
  { nombre:'Victoria Aguirre',         preview:'¡Genial! 😊 Quedo atenta para...', hora:'28/5' },
]

const POSTULACIONES_MOCK = [
  { nombre:'Antonia Soto Aguilar', puesto:'Abierto a cualquier puesto', turno:'ambos', tags:['cafe','cocina','servicio'], comuna:'Ñuñoa', exp:'1-2 años' },
  { nombre:'Isidora Gaete Bravo',  puesto:'Abierto a cualquier puesto', turno:'PM',    tags:['cafe','servicio','caja'],   comuna:'Ñuñoa', exp:'<6m' },
  { nombre:'Ginno Enzo Vitali',    puesto:'Barista',                    turno:'ambos', tags:['cafe','latte_art','cocina'],comuna:'Ñuñoa', exp:'<6m' },
  { nombre:'Bryan Arias Lasso',    puesto:'Mesero / Mesera',            turno:'ambos', tags:['servicio'],                 comuna:'Stgo',  exp:'+2 años' },
]

// ─── CALENDARIO ───────────────────────────────────────────────────────────
const DIAS = ['D','L','M','M','J','V','S']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function Calendario({ onSelectDay }) {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const diasPrev  = new Date(anio, mes, 0).getDate()

  const celdas = []
  for (let i = primerDia - 1; i >= 0; i--) celdas.push({ dia: diasPrev - i, esMes: false })
  for (let i = 1; i <= diasEnMes; i++)      celdas.push({ dia: i, esMes: true })
  let sig = 1
  while (celdas.length % 7 !== 0) celdas.push({ dia: sig++, esMes: false })

  const esHoy = c => c.esMes && c.dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
  const getRes = c => (!c.esMes ? 0 : (RESERVA_MAP[`${mes}-${c.dia}`] || []).length)

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div style={{fontFamily:'Nunito',fontSize:16,fontWeight:900,color:C.dark}}>📅 {MESES[mes]} {anio}</div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>{ if(mes===0){setMes(11);setAnio(a=>a-1)}else setMes(m=>m-1) }}
            style={{width:30,height:30,background:C.tealXL,border:'none',borderRadius:8,cursor:'pointer',color:C.teal,fontSize:16}}>‹</button>
          <button onClick={()=>{ if(mes===11){setMes(0);setAnio(a=>a+1)}else setMes(m=>m+1) }}
            style={{width:30,height:30,background:C.tealXL,border:'none',borderRadius:8,cursor:'pointer',color:C.teal,fontSize:16}}>›</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {DIAS.map(d => (
          <div key={d} style={{textAlign:'center',fontSize:10,fontWeight:800,color:C.gray500,padding:'4px 0 6px',textTransform:'uppercase'}}>{d}</div>
        ))}
        {celdas.map((c,i) => {
          const n = getRes(c)
          const hoyF = esHoy(c)
          return (
            <div key={i}
              onClick={() => c.esMes && n > 0 && onSelectDay(c.dia, mes)}
              style={{
                aspectRatio:'1', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', borderRadius:8, gap:2,
                cursor: n > 0 && c.esMes ? 'pointer' : 'default',
                background: hoyF ? C.teal : n > 0 && c.esMes ? C.tealXL : 'transparent',
              }}
            >
              <span style={{fontFamily:'Nunito',fontSize:13,fontWeight:n>0||hoyF?900:600,
                color: hoyF?'white' : !c.esMes?C.gray300 : C.dark, lineHeight:1}}>
                {c.dia}
              </span>
              {n > 0 && c.esMes && (
                <div style={{display:'flex',gap:2}}>
                  {Array(Math.min(n,3)).fill(0).map((_,j)=>(
                    <div key={j} style={{width:4,height:4,borderRadius:'50%',background: hoyF?'rgba(255,255,255,0.7)':C.tealLight}} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MÓDULO INICIO ────────────────────────────────────────────────────────
function Inicio({ gastos }) {
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const totalGasto = gastos.reduce((s,g) => s + Number(g.monto_bruto || 0), 0)
  const reservasFiltradas = diaSeleccionado
    ? RESERVAS_MOCK.filter(r => r.diaNum === diaSeleccionado.dia && r.mes === diaSeleccionado.mes)
    : RESERVAS_MOCK.slice(0,3)

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {[
          ['📅','Reservas mes','13','▼ 18.8%',C.red],
          ['👥','Pax próximas','63','5 reservas',C.gray500],
          ['📧','Emails mes','612','4 campañas',C.green],
          ['💬','Agente hoy','6','conversaciones',C.gray500],
        ].map(([icon,label,val,sub,sc])=>(
          <div key={label} style={{background:'white',borderRadius:14,padding:'14px 12px',boxShadow:`0 1px 8px rgba(0,122,138,0.08)`}}>
            <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.gray500,letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:4}}>{label}</div>
            <div style={{fontFamily:'Nunito',fontSize:22,fontWeight:900,color:C.dark,lineHeight:1}}>{val}</div>
            <div style={{fontSize:11,color:sc,marginTop:3,fontWeight:sc!==C.gray500?700:400}}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',marginBottom:12}}>
        <Calendario onSelectDay={(dia,mes)=>setDiaSeleccionado(p=>p?.dia===dia&&p?.mes===mes?null:{dia,mes})} />
      </div>

      <div style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',marginBottom:12}}>
        <div style={{fontFamily:'Nunito',fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>{diaSeleccionado ? `RESERVAS · ${diaSeleccionado.dia} ${MESES[diaSeleccionado.mes].slice(0,3).toUpperCase()}` : 'PRÓXIMAS RESERVAS'}</span>
          {diaSeleccionado && <button onClick={()=>setDiaSeleccionado(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:C.teal,fontWeight:800}}>VER TODAS</button>}
        </div>
        {reservasFiltradas.map(r => (
          <div key={r.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'11px 0',borderBottom:`1px solid ${C.gray100}`}}>
            <div style={{minWidth:52,textAlign:'center',background:C.tealXL,borderRadius:10,padding:'8px 6px',flexShrink:0}}>
              <div style={{fontFamily:'Nunito',fontSize:15,fontWeight:900,color:C.teal,lineHeight:1}}>{r.hora}</div>
              <div style={{fontSize:9,color:C.gray500,fontWeight:700,textTransform:'uppercase',marginTop:2}}>hrs</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:'Nunito',fontSize:14,fontWeight:800,color:C.dark,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.nombre}</div>
              <div style={{fontSize:11,color:C.gray500,marginTop:2}}>📱 {r.tel}</div>
            </div>
            <div style={{flexShrink:0,textAlign:'right'}}>
              <div style={{fontFamily:'Nunito',fontSize:16,fontWeight:900,color:C.teal}}>{r.pax}</div>
              <div style={{fontSize:9,color:C.gray500,textTransform:'uppercase'}}>pax</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)'}}>
        <div style={{fontFamily:'Nunito',fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:12}}>GASTOS ESTE MES</div>
        <div style={{display:'flex',gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:'Nunito',fontSize:20,fontWeight:900,color:C.dark}}>{formatMonto(totalGasto)}</div>
            <div style={{fontSize:11,color:C.gray500}}>gasto bruto · {gastos.length} registros</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MÓDULO RESERVAS ──────────────────────────────────────────────────────
function Reservas() {
  const grupos = [
    { label:'MAÑANA · 2', items: RESERVAS_MOCK.slice(0,2) },
    { label:'ESTA SEMANA · 1', items: RESERVAS_MOCK.slice(2,3) },
    { label:'MÁS ADELANTE · 2', items: RESERVAS_MOCK.slice(3) },
  ]
  return (
    <div>
      <p style={{fontFamily:'Nunito',fontSize:20,fontWeight:900,color:C.dark,marginBottom:4}}>Reservas</p>
      <p style={{fontSize:12,color:C.gray500,marginBottom:16}}>Casa Turquesa · próximas confirmadas</p>
      {grupos.map(g=>(
        <div key={g.label}>
          <div style={{marginBottom:8,fontFamily:'Nunito',fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:'0.8px',textTransform:'uppercase'}}>{g.label}</div>
          {g.items.map(r=>(
            <div key={r.id} style={{background:'white',borderRadius:14,padding:14,marginBottom:10,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{textAlign:'center',minWidth:50,background:C.tealXL,borderRadius:10,padding:'8px 4px',flexShrink:0}}>
                <div style={{fontFamily:'Nunito',fontSize:16,fontWeight:900,color:C.teal}}>{r.hora}</div>
                <div style={{fontSize:10,color:C.gray500}}>{r.fecha.split(' ')[0]}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Nunito',fontSize:15,fontWeight:800,color:C.dark}}>{r.nombre}</div>
                <div style={{fontSize:12,color:C.gray500,marginTop:2}}>📱 {r.tel} · {r.pax} pax</div>
                <div style={{display:'flex',gap:6,marginTop:6}}>
                  <a href={`https://wa.me/${r.tel}`} target="_blank" rel="noreferrer"
                    style={{background:'#25d366',color:'white',border:'none',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700,cursor:'pointer',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── MÓDULO CAMPAÑAS ──────────────────────────────────────────────────────
function Campanas() {
  const [tab, setTab] = useState('meta')
  return (
    <div>
      <p style={{fontFamily:'Nunito',fontSize:20,fontWeight:900,color:C.dark,marginBottom:4}}>Campañas</p>
      <p style={{fontSize:12,color:C.gray500,marginBottom:12}}>Casa Turquesa</p>
      <div style={{display:'flex',borderBottom:`2px solid ${C.gray100}`,marginBottom:16}}>
        {[['meta','Meta Ads'],['email','Email'],['agente','Agente IA']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:'10px 8px',background:'none',border:'none',cursor:'pointer',fontFamily:'Nunito',fontSize:12,fontWeight:800,color:tab===k?C.teal:C.gray500,borderBottom:`2px solid ${tab===k?C.teal:'transparent'}`,marginBottom:-2,textTransform:'uppercase',letterSpacing:'0.5px'}}>{l}</button>
        ))}
      </div>
      {tab==='meta' && (
        <>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {[['🟢','Activas','1'],['💰','Gasto','$124.957'],['👁','Alcance','32.239'],['💬','Mensajes','331']].map(([ic,lb,vl])=>(
              <div key={lb} style={{background:'white',borderRadius:14,padding:'14px 12px',boxShadow:'0 1px 8px rgba(0,122,138,0.08)'}}>
                <div style={{fontSize:20,marginBottom:6}}>{ic}</div>
                <div style={{fontSize:10,fontWeight:700,color:C.gray500,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:4}}>{lb}</div>
                <div style={{fontFamily:'Nunito',fontSize:20,fontWeight:900,color:C.dark}}>{vl}</div>
              </div>
            ))}
          </div>
          <div style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',borderLeft:`4px solid ${C.tealLight}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:15,color:C.dark}}>Nueva campaña de Interacción</div>
                <div style={{fontSize:11,color:C.gray500}}>Objetivo: Interacción · 13 abr. 2026</div>
              </div>
              <span style={{background:'#e8f8ef',color:'#27ae60',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>ACTIVA</span>
            </div>
            <div style={{background:C.tealXL,borderRadius:10,padding:'10px 14px',borderLeft:`3px solid ${C.amber}`}}>
              <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:13,color:C.amber}}>⚠️ Rendimiento mixto</div>
              <div style={{fontSize:11,color:C.gray700,marginTop:4}}>CTR 5.3% ✅ · Calidad 28.1% 🟡 · Conversión 16.5% 🟡</div>
            </div>
          </div>
        </>
      )}
      {tab==='email' && (
        <>
          {[
            { tipo:'2x1_viernes', nombre:'2x1 Primer Viernes del Mes', envios:388, ejec:1, ultima:'01-05-2026', color:C.red },
            { tipo:'sorteo_cafe', nombre:'Sorteo Diario Café', envios:144, ejec:29, ultima:'29-05-2026', color:'#7c5cbf' },
            { tipo:'cumpleanos_proximo', nombre:'Cumpleaños (5 días antes)', envios:41, ejec:5, ultima:'26-05-2026', color:C.amber },
            { tipo:'bienvenida', nombre:'Bienvenida Clientes Nuevos', envios:39, ejec:18, ultima:'28-05-2026', color:C.green },
          ].map(c=>(
            <div key={c.tipo} style={{borderLeft:`4px solid ${c.color}`,padding:'12px 14px',background:'white',borderRadius:'0 12px 12px 0',marginBottom:10,boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',color:c.color,marginBottom:4}}>{c.tipo}</div>
              <div style={{fontFamily:'Nunito',fontSize:13,fontWeight:900,color:C.dark}}>{c.nombre}</div>
              <div style={{display:'flex',gap:12,marginTop:8,justifyContent:'space-between'}}>
                <div><div style={{fontFamily:'Nunito',fontSize:18,fontWeight:900,color:C.dark}}>{c.envios}</div><div style={{fontSize:10,color:C.gray500,textTransform:'uppercase'}}>envíos · {c.ejec} ejec.</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:11,color:C.gray500}}>última</div><div style={{fontSize:12,fontWeight:700,color:C.dark}}>{c.ultima}</div></div>
              </div>
            </div>
          ))}
        </>
      )}
      {tab==='agente' && (
        <>
          <div style={{background:'#7c5cbf',borderRadius:14,padding:'14px 16px',marginBottom:14,display:'flex',gap:12,alignItems:'center'}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🤖</div>
            <div>
              <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:16,color:'white'}}>Agente IA — Martina</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>WhatsApp + Instagram</div>
            </div>
          </div>
          <div style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)'}}>
            <div style={{fontFamily:'Nunito',fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:12}}>CONVERSACIONES HOY</div>
            {CONVERSACIONES.map((c,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:i<CONVERSACIONES.length-1?`1px solid ${C.gray100}`:'none'}}>
                <div style={{width:42,height:42,borderRadius:'50%',background:'#7c5cbf',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito',fontSize:15,fontWeight:800,flexShrink:0}}>{initials(c.nombre)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'Nunito',fontSize:13,fontWeight:800,color:C.dark}}>{c.nombre}</div>
                  <div style={{fontSize:11,color:C.gray500,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.preview}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:10,color:C.gray500}}>{c.hora}</div>
                  <div style={{width:18,height:18,borderRadius:'50%',background:'#7c5cbf',color:'white',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',marginTop:4,marginLeft:'auto'}}>1</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── MÓDULO GASTOS (Supabase real) ────────────────────────────────────────
function Gastos({ gastos, loading }) {
  const [empresa, setEmpresa] = useState('malvarrosa')
  const [busqueda, setBusqueda] = useState('')

  const gastosFiltrados = gastos.filter(g => {
    const q = busqueda.toLowerCase()
    return !q || (g.proveedor||'').toLowerCase().includes(q) || (g.producto||'').toLowerCase().includes(q)
  })

  const totalBruto  = gastos.reduce((s,g) => s + Number(g.monto_bruto  || 0), 0)
  const totalIva    = gastos.reduce((s,g) => s + Number(g.iva          || 0), 0)
  const totalNeto   = gastos.reduce((s,g) => s + Number(g.monto_neto   || 0), 0)

  return (
    <div>
      <p style={{fontFamily:'Nunito',fontSize:20,fontWeight:900,color:C.dark,marginBottom:4}}>Contabilidad</p>
      <p style={{fontSize:12,color:C.gray500,marginBottom:12}}>Gastos e insumos · Supabase en vivo</p>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'white',borderRadius:12,padding:'10px 16px',marginBottom:12,boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
        <button style={{width:32,height:32,background:C.tealXL,border:'none',borderRadius:8,fontSize:16,cursor:'pointer',color:C.teal}}>‹</button>
        <span style={{fontFamily:'Nunito',fontSize:15,fontWeight:800,color:C.dark}}>Mayo 2026</span>
        <button style={{width:32,height:32,background:C.tealXL,border:'none',borderRadius:8,fontSize:16,cursor:'pointer',color:C.teal}}>›</button>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {[['malvarrosa','Malvarrosa SpA'],['venta','Venta Alimentos'],['ambas','Ambas']].map(([k,l])=>(
          <button key={k} onClick={()=>setEmpresa(k)} style={{padding:'7px 12px',borderRadius:20,border:'none',cursor:'pointer',fontFamily:'Nunito',fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.5px',background:empresa===k?C.teal:C.gray100,color:empresa===k?'white':C.gray500}}>{l}</button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {[
          ['💰','Gasto bruto', loading?'…':formatMonto(totalBruto),'mes en curso'],
          ['🧾','Total IVA',   loading?'…':formatMonto(totalIva),'19% fiscal'],
          ['📊','Gasto neto',  loading?'…':formatMonto(totalNeto),'sin IVA'],
          ['📄','N° registros',loading?'…':gastos.length,'cargados'],
        ].map(([ic,lb,vl,sb])=>(
          <div key={lb} style={{background:'white',borderRadius:14,padding:'14px 12px',boxShadow:'0 1px 8px rgba(0,122,138,0.08)'}}>
            <div style={{fontSize:20,marginBottom:6}}>{ic}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.gray500,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:4}}>{lb}</div>
            <div style={{fontFamily:'Nunito',fontSize:18,fontWeight:900,color:C.dark}}>{vl}</div>
            <div style={{fontSize:11,color:C.gray500,marginTop:3}}>{sb}</div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)'}}>
        <div style={{fontFamily:'Nunito',fontSize:11,fontWeight:800,color:C.gray500,letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:12}}>HISTORIAL · {gastosFiltrados.length} resultados</div>
        <input
          placeholder="Buscar proveedor o producto..."
          value={busqueda}
          onChange={e=>setBusqueda(e.target.value)}
          style={{width:'100%',padding:'8px 12px',borderRadius:10,border:`1.5px solid ${C.gray100}`,fontSize:12,marginBottom:10,outline:'none',fontFamily:'Nunito Sans'}}
        />
        {loading ? (
          <div style={{textAlign:'center',padding:'24px 0',color:C.gray500}}>Cargando desde Supabase…</div>
        ) : (
          gastosFiltrados.slice(0,30).map((g,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<Math.min(gastosFiltrados.length,30)-1?`1px solid ${C.gray100}`:'none'}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.dark}}>{g.producto || g.descripcion || '—'}</div>
                <div style={{fontSize:11,color:C.gray500,marginTop:1}}>{g.proveedor || '—'} · {g.fecha || ''}</div>
              </div>
              <div style={{fontFamily:'Nunito',fontSize:14,fontWeight:900,color:C.dark}}>{formatMonto(g.monto_bruto || 0)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── MÓDULO FORMULARIOS (Supabase real) ───────────────────────────────────
function Formularios({ postulaciones, loadingForms }) {
  const [tab, setTab] = useState('postulaciones')
  const [busqueda, setBusqueda] = useState('')

  const filtradas = postulaciones.filter(p => {
    const q = busqueda.toLowerCase()
    return !q || (p.nombre||'').toLowerCase().includes(q) || (p.puesto||'').toLowerCase().includes(q)
  })

  return (
    <div>
      <p style={{fontFamily:'Nunito',fontSize:20,fontWeight:900,color:C.dark,marginBottom:4}}>Formularios</p>
      <p style={{fontSize:12,color:C.gray500,marginBottom:12}}>Casa Turquesa · datos en vivo</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        {[
          [postulaciones.length||'…','Postulaciones',''],
          ['10','Proveedores',''],
          ['3','Talleristas',''],
          ['594','Clientes QR',''],
        ].map(([n,l,s])=>(
          <div key={l} style={{background:'white',borderRadius:14,padding:14,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',textAlign:'center'}}>
            <div style={{fontFamily:'Nunito',fontSize:28,fontWeight:900,color:C.teal}}>{n}</div>
            <div style={{fontSize:11,fontWeight:700,color:C.gray500,textTransform:'uppercase',letterSpacing:'0.8px',marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{borderBottom:`2px solid ${C.gray100}`,marginBottom:14}}>
        <div style={{display:'flex',overflowX:'auto'}}>
          {[['postulaciones','Postulaciones'],['proveedores','Proveedores'],['talleristas','Talleristas'],['clientes','Clientes QR']].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flexShrink:0,padding:'8px 14px',background:'none',border:'none',cursor:'pointer',fontFamily:'Nunito',fontSize:12,fontWeight:800,color:tab===k?C.teal:C.gray500,borderBottom:`2px solid ${tab===k?C.teal:'transparent'}`,marginBottom:-2,whiteSpace:'nowrap'}}>{l}</button>
          ))}
        </div>
      </div>

      {tab==='postulaciones' && (
        <>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <input placeholder="Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}
              style={{flex:1,padding:'8px 12px',borderRadius:10,border:`1.5px solid ${C.gray100}`,fontSize:12,outline:'none'}} />
          </div>
          <button style={{width:'100%',background:C.teal,color:'white',border:'none',borderRadius:12,padding:11,fontFamily:'Nunito',fontSize:13,fontWeight:800,cursor:'pointer',marginBottom:12}}>
            📥 EXPORTAR CSV ({postulaciones.length})
          </button>
          {loadingForms ? (
            <div style={{textAlign:'center',padding:'24px 0',color:C.gray500}}>Cargando…</div>
          ) : (
            filtradas.slice(0,20).map((p,i)=>(
              <div key={i} style={{background:'white',borderRadius:14,padding:14,marginBottom:10,boxShadow:'0 1px 8px rgba(0,122,138,0.08)'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                  <div style={{width:42,height:42,borderRadius:'50%',background:`linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito',fontSize:15,fontWeight:900,flexShrink:0}}>
                    {initials(p.nombre||'')}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Nunito',fontSize:14,fontWeight:800,color:C.dark}}>{p.nombre||'—'}</div>
                    <div style={{fontSize:12,color:C.gray500,marginTop:2}}>{p.puesto||''} · {p.turno||''} · {p.comuna||''}</div>
                  </div>
                  <span style={{background:C.tealXL,color:C.teal,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{p.experiencia||p.exp||'—'}</span>
                </div>
                {p.tel && (
                  <a href={`https://wa.me/${p.tel}`} target="_blank" rel="noreferrer"
                    style={{display:'inline-flex',alignItems:'center',gap:4,background:'#25d366',color:'white',border:'none',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700,textDecoration:'none'}}>
                    💬 WhatsApp
                  </a>
                )}
              </div>
            ))
          )}
        </>
      )}
      {tab==='clientes' && (
        <div style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 1px 8px rgba(0,122,138,0.08)',textAlign:'center'}}>
          <div style={{fontFamily:'Nunito',fontSize:48,fontWeight:900,color:C.teal}}>594</div>
          <div style={{fontSize:14,color:C.gray500}}>clientes registrados</div>
          <div style={{fontSize:12,color:C.gray300,marginTop:4}}>mes actual: 41 · semana: 5</div>
        </div>
      )}
    </div>
  )
}

// ─── NAV ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:'inicio',    icon:'🏠', label:'Inicio' },
  { id:'reservas',  icon:'📅', label:'Reservas',    badge:'5' },
  { id:'campanas',  icon:'📣', label:'Campañas' },
  { id:'gastos',    icon:'📊', label:'Gastos' },
  { id:'forms',     icon:'📋', label:'Formularios', badge:'50' },
]

const NEGOCIOS = [
  { id:'casa_turquesa',   label:'Casa Turquesa',   emoji:'🏠', sub:'Cafetería · Ñuñoa' },
  { id:'monkey_d_market', label:'Monkey D. Market', emoji:'🏴‍☠️', sub:'Minimarket' },
]

// ─── APP ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab]           = useState('inicio')
  const [negocio, setNegocio]   = useState('casa_turquesa')
  const [sidebarOpen, setSidebar] = useState(false)

  // Supabase: gastos
  const [gastos, setGastos]         = useState([])
  const [loadingGastos, setLoadingGastos] = useState(true)

  // Supabase: postulaciones
  const [postulaciones, setPostulaciones]   = useState([])
  const [loadingForms, setLoadingForms]     = useState(true)

  useEffect(() => {
    async function fetchGastos() {
      setLoadingGastos(true)
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(200)
      if (!error && data) setGastos(data)
      setLoadingGastos(false)
    }
    fetchGastos()
  }, [negocio])

  useEffect(() => {
    async function fetchPostulaciones() {
      setLoadingForms(true)
      const { data, error } = await supabase
        .from('postulaciones')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setPostulaciones(data)
      setLoadingForms(false)
    }
    fetchPostulaciones()
  }, [])

  const neg = NEGOCIOS.find(n => n.id === negocio)

  const navigate = (id) => {
    setTab(id)
    setSidebar(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8fafb',position:'relative',overflow:'hidden'}}>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div onClick={()=>setSidebar(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300,maxWidth:430,margin:'0 auto',left:0,right:0}} />
      )}

      {/* Sidebar */}
      <div style={{
        position:'fixed',top:0,left:0,
        width:'78%',maxWidth:310,height:'100%',
        background:'#0d2b32',zIndex:400,
        transform:sidebarOpen?'translateX(0)':'translateX(-100%)',
        transition:'transform 0.32s cubic-bezier(.4,0,.2,1)',
        display:'flex',flexDirection:'column',overflow:'hidden',
      }}>
        <div style={{padding:'54px 24px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <div style={{fontFamily:'Nunito',fontSize:22,fontWeight:900,color:'white',letterSpacing:'0.5px'}}>MIS NEGOCIOS</div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:3,color:C.tealLight,textTransform:'uppercase',marginTop:4}}>Portal de gestión</div>
        </div>

        {/* Negocio switcher */}
        <div style={{padding:'14px 24px 0'}}>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',marginBottom:8}}>Negocio activo</div>
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:12,overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)'}}>
            {NEGOCIOS.map(n=>(
              <button key={n.id} onClick={()=>setNegocio(n.id)}
                style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 14px',background:'none',border:'none',cursor:'pointer',color:negocio===n.id?C.tealLight:'rgba(255,255,255,0.5)',fontFamily:'Nunito',fontSize:12,fontWeight:700,borderBottom:'1px solid rgba(255,255,255,0.06)',transition:'all 0.2s'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:negocio===n.id?C.tealLight:'#3d5560',flexShrink:0}} />
                <div style={{textAlign:'left'}}>
                  <div>{n.emoji} {n.label}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',marginTop:1}}>{n.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav style={{padding:'20px 0',flex:1,overflowY:'auto'}}>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',padding:'0 24px',marginBottom:6}}>Módulos</div>
          {NAV.map(n=>(
            <div key={n.id} onClick={()=>navigate(n.id)}
              style={{display:'flex',alignItems:'center',gap:14,padding:'13px 24px',cursor:'pointer',color:tab===n.id?'white':'rgba(255,255,255,0.55)',fontFamily:'Nunito',fontSize:14,fontWeight:700,borderLeft:`3px solid ${tab===n.id?C.tealLight:'transparent'}`,background:tab===n.id?'rgba(16,207,201,0.1)':'transparent',transition:'all 0.2s'}}>
              <span style={{fontSize:18,width:22,textAlign:'center'}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.badge && <span style={{background:C.tealLight,color:C.dark,fontSize:10,fontWeight:900,padding:'2px 7px',borderRadius:20}}>{n.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{padding:'16px 24px',borderTop:'1px solid rgba(255,255,255,0.07)',fontSize:10,color:'rgba(255,255,255,0.25)',letterSpacing:1,textTransform:'uppercase',fontWeight:700}}>
          Eric Hansen · eric@casaturquesa.cl
        </div>
      </div>

      {/* Topbar */}
      <div style={{background:`linear-gradient(135deg, ${C.teal} 0%, #005f6e 100%)`,padding:'16px 20px',display:'flex',alignItems:'center',gap:14,position:'sticky',top:0,zIndex:200,boxShadow:'0 2px 12px rgba(0,0,0,0.15)'}}>
        <button onClick={()=>setSidebar(true)}
          style={{width:40,height:40,background:'rgba(255,255,255,0.12)',border:'none',borderRadius:10,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5,flexShrink:0}}>
          {[0,1,2].map(i=><div key={i} style={{width:18,height:2,background:'white',borderRadius:2}} />)}
        </button>
        <div style={{flex:1}}>
          <div style={{fontFamily:'Nunito',fontSize:15,fontWeight:900,color:'white',letterSpacing:'0.5px'}}>{neg.emoji} {neg.label}</div>
          <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,0.6)',letterSpacing:'1.5px',textTransform:'uppercase'}}>{NAV.find(n=>n.id===tab)?.label}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:20,padding:'5px 10px',color:'white',fontSize:11,fontWeight:700}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#4ade80'}} />
          EN VIVO
        </div>
      </div>

      {/* Content */}
      <div style={{padding:'16px 16px 40px'}}>
        {tab==='inicio'   && <Inicio   gastos={gastos} />}
        {tab==='reservas' && <Reservas />}
        {tab==='campanas' && <Campanas />}
        {tab==='gastos'   && <Gastos   gastos={gastos} loading={loadingGastos} />}
        {tab==='forms'    && <Formularios postulaciones={postulaciones} loadingForms={loadingForms} />}
      </div>
    </div>
  )
}
